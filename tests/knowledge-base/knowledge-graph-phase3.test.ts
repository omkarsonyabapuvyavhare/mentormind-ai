// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRunWithProviderFailover = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai/providers/failover", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/providers/failover")>();
  return {
    ...actual,
    runWithProviderFailover: mockRunWithProviderFailover,
  };
});

vi.mock("@/lib/ai/providers/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/providers/config")>();
  return {
    ...actual,
    isAnyAiProviderConfigured: () => true,
    isGeminiConfigured: () => true,
    isGrokConfigured: () => true,
  };
});

import { demo } from "@/constants/demo";
import { buildKgAssessment } from "@/knowledge-base/generation";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import {
  validateAssessmentAgainstKg,
  validateLessonAgainstKg,
  validateRoadmapAgainstKg,
} from "@/knowledge-base/validation";
import { generateLessonForLearner } from "@/lib/ai/lesson-service";
import { generateRoadmapForOnboarding } from "@/lib/ai/roadmap-service";
import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import {
  ASSESSMENT_CACHE_VERSION,
  readCachedAssessment,
  writeCachedAssessment,
} from "@/lib/assessment/assessment-session-cache";
import {
  LESSON_CACHE_VERSION,
  readCachedLesson,
  writeCachedLesson,
} from "@/lib/learn/lesson-session-cache";
import { ensureKgLessonPassesLiveGates } from "@/lib/knowledge-graph";
import {
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import { createTestAppStore } from "@/stores/use-app-store";
import { buildTestOnboardingInput } from "../helpers/onboarding-input";

const START = "2026-08-01T00:00:00.000Z";
const TWIN_ID = "learner-kg-phase3";

const PRIMARY_GOALS = [
  {
    label: "Python",
    goalTitle: "Learn Python",
    goalSlug: "learn-python",
    goalCategory: "Programming" as const,
    graphId: "kg-python",
  },
  {
    label: "SQL",
    goalTitle: "Learn SQL",
    goalSlug: "learn-sql",
    goalCategory: "Data" as const,
    graphId: "kg-sql",
  },
  {
    label: "React",
    goalTitle: "Learn React",
    goalSlug: "learn-react",
    goalCategory: "Web Development" as const,
    graphId: "kg-react",
  },
  {
    label: "Kubernetes",
    goalTitle: "Learn Kubernetes",
    goalSlug: "learn-kubernetes",
    goalCategory: "DevOps" as const,
    graphId: "kg-kubernetes",
  },
  {
    label: "Data Engineering",
    goalTitle: "Learn Data Engineering",
    goalSlug: "learn-data-engineering",
    goalCategory: "Data" as const,
    graphId: "kg-data-engineering",
  },
] as const;

function failBothProviders(message = "provider unavailable") {
  mockRunWithProviderFailover.mockResolvedValue({
    ok: false,
    reason: "api_error",
    message,
    attempts: [
      { provider: "gemini", reason: "api_error", message },
      { provider: "grok", reason: "api_error", message },
    ],
  });
}

describe("knowledge graph phase 3 integration", () => {
  beforeEach(() => {
    mockRunWithProviderFailover.mockReset();
    failBothProviders();
    window.sessionStorage.clear();
  });

  describe("A–E. KG failover roadmaps for primary goals", () => {
    it.each(PRIMARY_GOALS.map((goal) => [goal.label, goal] as const))(
      "%s: Gemini+Grok fail → KG roadmap with canonical topic ids",
      async (_label, goal) => {
        const input = buildTestOnboardingInput({
          goalSlug: goal.goalSlug,
          goalTitle: goal.goalTitle,
          goalCategory: goal.goalCategory,
          goalType: "Skill",
          durationWeeks: 8,
        });

        const result = await generateRoadmapForOnboarding(input, TWIN_ID, START);
        expect(result.source).toBe("kg");
        expect(result.roadmap.knowledgeGraphId).toBe(goal.graphId);
        expect(result.roadmap.kgValidationVersion).toBe(KG_VALIDATION_VERSION);
        expect(result.roadmap.milestones.length).toBeGreaterThanOrEqual(4);
        expect(result.roadmap.tasks.every((task) => task.canonicalTopicId)).toBe(true);
        expect(result.roadmap.tasks.filter((task) => task.unlocked).length).toBeGreaterThan(0);

        const haystack = JSON.stringify(result.roadmap).toLowerCase();
        expect(haystack).not.toMatch(/\bcore concepts\b/);
        if (goal.graphId === "kg-python" || goal.graphId === "kg-sql" || goal.graphId === "kg-react") {
          expect(haystack).not.toMatch(/\b(aws|vpc|ec2)\b/);
        }

        const resolved = resolveKnowledgeGraph(goal.goalTitle, goal.goalCategory);
        expect(resolved.status).toBe("resolved");

        const topics = result.roadmap.milestones.map((milestone, index) => {
          const topicId = milestone.canonicalTopicId ?? milestone.topicIds[0]!;
          const topic = resolved.graph!.topics.find((entry) => entry.id === topicId);
          return { title: topic?.title ?? topicId, order: index + 1 };
        });

        const revalidated = validateRoadmapAgainstKg({
          goalTitle: goal.goalTitle,
          goalCategory: goal.goalCategory,
          topics,
          graph: resolved.graph,
        });
        expect(revalidated.ok).toBe(true);
      },
    );
  });

  describe("F. Unsupported curriculum", () => {
    it("does not map obscure goals onto a random KG or AWS/Foundations", async () => {
      const input = buildTestOnboardingInput({
        goalSlug: "learn-underwater-basket-weaving",
        goalTitle: "Learn Underwater Basket Weaving",
        goalCategory: "General Technology",
        goalType: "Skill",
        durationWeeks: 6,
      });

      expect(resolveKnowledgeGraph(input.goalTitle, input.goalCategory).status).toBe(
        "unsupported",
      );

      const result = await generateRoadmapForOnboarding(input, TWIN_ID, START, {
        recommendedFocusAreas: ["Reed Preparation", "Submerged Knotting"],
      });

      expect(result.source).not.toBe("kg");
      expect(result.fallbackReason).toBe("unsupported-curriculum");
      expect(result.roadmap.knowledgeGraphId).toBeUndefined();
      const haystack = JSON.stringify(result.roadmap).toLowerCase();
      expect(haystack).not.toMatch(/\b(aws|vpc|ec2|saa-c03)\b/);
      expect(haystack).not.toMatch(/\bfoundations\b/);
    });
  });

  describe("G. Lesson + assessment KG path and cache versions", () => {
    it("ensureKgLessonPassesLiveGates for all primary graphs (exactly 5 KCs)", () => {
      for (const goal of PRIMARY_GOALS) {
        const resolved = resolveKnowledgeGraph(goal.goalTitle, goal.goalCategory);
        expect(resolved.status).toBe("resolved");
        const topic = resolved.graph!.topics[0]!;
        const ensured = ensureKgLessonPassesLiveGates({
          topicId: topic.id,
          graph: resolved.graph,
          goalTitle: goal.goalTitle,
          goalCategory: goal.goalCategory,
          goalSlug: goal.goalSlug,
          topicTitle: topic.title,
        });
        expect(ensured.ok).toBe(true);
        if (!ensured.ok) continue;

        const kcCount = ensured.lesson.sections.reduce(
          (total, section) => total + section.knowledgeCheck.length,
          0,
        );
        expect(kcCount).toBe(5);
        expect(
          validateLessonAgainstKg({
            goalTitle: goal.goalTitle,
            goalCategory: goal.goalCategory,
            topicTitle: topic.title,
            lesson: ensured.lesson,
            graph: resolved.graph,
          }).ok,
        ).toBe(true);
      }
    });

    it("lesson service falls back to KG when providers fail", async () => {
      const goal = PRIMARY_GOALS[0]!;
      const resolved = resolveKnowledgeGraph(goal.goalTitle, goal.goalCategory);
      const topic = resolved.graph!.topics[0]!;

      const result = await generateLessonForLearner({
        goalId: goal.goalSlug,
        goalSlug: goal.goalSlug,
        goalTitle: goal.goalTitle,
        goalCategory: goal.goalCategory,
        goalType: "Skill",
        topicId: topic.id,
        topicTitle: topic.title,
        skillLevel: "beginner",
        durationMinutes: 30,
        learningObjectives: topic.learningObjectives,
        preferredFormats: ["reading", "quiz"],
      });

      expect(result.generationPath).toBe("kg");
      expect(result.lesson.knowledgeGraphId).toBe(goal.graphId);
      expect(result.lesson.canonicalTopicId).toBe(topic.id);
      expect(result.lesson.kgValidationVersion).toBe(KG_VALIDATION_VERSION);
    });

    it("assessment KG path covers ≥4 concepts and ≥3 types", () => {
      const goal = PRIMARY_GOALS[0]!;
      const resolved = resolveKnowledgeGraph(goal.goalTitle, goal.goalCategory);
      const topic = resolved.graph!.topics[0]!;
      const ensured = ensureKgLessonPassesLiveGates({
        topicId: topic.id,
        graph: resolved.graph,
        goalTitle: goal.goalTitle,
        goalCategory: goal.goalCategory,
        goalSlug: goal.goalSlug,
        topicTitle: topic.title,
      });
      expect(ensured.ok).toBe(true);
      if (!ensured.ok) return;

      const assessment = buildAssessmentFromLesson(
        {
          ...ensured.lesson,
          topicId: topic.id,
          source: "deterministic",
          knowledgeGraphId: ensured.knowledgeGraphId,
          canonicalTopicId: ensured.canonicalTopicId,
          kgValidationVersion: KG_VALIDATION_VERSION,
        },
        {
          goalSlug: goal.goalSlug,
          goalTitle: goal.goalTitle,
          goalCategory: goal.goalCategory,
        },
      );

      expect(assessment.questions).toHaveLength(5);
      expect(assessment.knowledgeGraphId).toBe(goal.graphId);

      const kgQuestions = buildKgAssessment({
        topicId: topic.id,
        graph: resolved.graph,
      });
      expect(kgQuestions.ok).toBe(true);
      if (!kgQuestions.ok) return;

      const validation = validateAssessmentAgainstKg({
        goalTitle: goal.goalTitle,
        goalCategory: goal.goalCategory,
        topicTitle: topic.title,
        questions: kgQuestions.questions,
        graph: resolved.graph,
      });
      expect(validation.ok).toBe(true);
      expect(validation.uniqueConceptIds.length).toBeGreaterThanOrEqual(4);
      expect(validation.questionTypes.length).toBeGreaterThanOrEqual(3);
    });

    it("uses lesson/assessment cache v5 and rejects missing KG metadata", () => {
      expect(LESSON_CACHE_VERSION).toBe("v5");
      expect(ASSESSMENT_CACHE_VERSION).toBe("v5");

      const topicId = "python-syntax-and-data-types";
      const ensured = ensureKgLessonPassesLiveGates({
        topicId,
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalSlug: "learn-python",
        topicTitle: "Python Syntax and Data Types",
      });
      expect(ensured.ok).toBe(true);
      if (!ensured.ok) return;

      writeCachedLesson(
        "learn-python",
        {
          ...ensured.lesson,
          topicId,
          source: "deterministic",
        },
        "kg",
      );
      expect(
        readCachedLesson("learn-python", topicId, {
          goalTitle: "Learn Python",
          goalCategory: "Programming",
        }),
      ).toBeNull();

      writeCachedLesson(
        "learn-python",
        {
          ...ensured.lesson,
          topicId,
          source: "deterministic",
          knowledgeGraphId: ensured.knowledgeGraphId,
          canonicalTopicId: ensured.canonicalTopicId,
          kgValidationVersion: KG_VALIDATION_VERSION,
        },
        "kg",
      );
      expect(
        readCachedLesson("learn-python", topicId, {
          goalTitle: "Learn Python",
          goalCategory: "Programming",
        })?.knowledgeGraphId,
      ).toBe("kg-python");

      const assessment = buildAssessmentFromLesson(
        {
          ...ensured.lesson,
          topicId,
          source: "deterministic",
          knowledgeGraphId: ensured.knowledgeGraphId,
          canonicalTopicId: ensured.canonicalTopicId,
          kgValidationVersion: KG_VALIDATION_VERSION,
        },
        {
          goalSlug: "learn-python",
          goalTitle: "Learn Python",
          goalCategory: "Programming",
        },
      );

      writeCachedAssessment("learn-python", {
        ...assessment,
        knowledgeGraphId: undefined,
        canonicalTopicId: undefined,
      });
      expect(
        readCachedAssessment("learn-python", topicId, {
          goalTitle: "Learn Python",
          goalCategory: "Programming",
        }),
      ).toBeNull();

      writeCachedAssessment("learn-python", assessment, {
        goalTitle: "Learn Python",
        goalCategory: "Programming",
      });
      expect(
        readCachedAssessment("learn-python", topicId, {
          goalTitle: "Learn Python",
          goalCategory: "Programming",
        })?.knowledgeGraphId,
      ).toBe("kg-python");
    });
  });

  describe("H. Presenter 42/95 and Fast Forward unchanged", () => {
    it("preserves presenter score constants and demo orchestration", () => {
      expect(PRESENTER_WEAK_SCORE).toBe(demo.weakQuizScore);
      expect(PRESENTER_MASTERY_SCORE).toBe(demo.masteryQuizScore);
      expect(demo.weakQuizScore).toBe(42);
      expect(demo.masteryQuizScore).toBe(95);

      const store = createTestAppStore();
      store.getState().initializeDemoLearner(START);
      expect(store.getState().roadmap).toBeTruthy();
      store.getState().runNextDemoStep(START);
      expect(store.getState().isInitialized).toBe(true);
    });
  });

  describe("AWS SAA remains valid", () => {
    it("keeps AWS seed/deterministic path", async () => {
      const input = buildTestOnboardingInput({
        goalSlug: "aws-saa-c03",
        goalTitle: "AWS Solutions Architect Associate",
        goalCategory: "Cloud",
        goalType: "Certification",
      });

      const result = await generateRoadmapForOnboarding(input, TWIN_ID, START);
      expect(result.roadmap.goalId).toBe("aws-saa-c03");
      expect(JSON.stringify(result.roadmap).toLowerCase()).toMatch(/vpc|aws|ec2|iam/);
    });
  });

  describe("Provider accept path (mocked Gemini success + KG validate)", () => {
    it("accepts Gemini roadmap when topics map to KG", async () => {
      const resolved = resolveKnowledgeGraph("Learn Python", "Programming");
      expect(resolved.status).toBe("resolved");
      const topics = resolved.graph!.topics.slice(0, 8);

      mockRunWithProviderFailover.mockImplementation(async ({ finalize }) => {
        const payload = {
          milestones: topics.map((topic, index) => ({
            title: `Week ${index + 1}: ${topic.title}`,
            description: topic.description.slice(0, 200),
            week: index + 1,
            topicTitle: topic.title,
            tasks: [
              {
                title: `Lesson: ${topic.title}`,
                type: "lesson",
                durationMinutes: 30,
                description: `Study ${topic.title}`,
                learningObjectives: topic.learningObjectives.slice(0, 2),
              },
              {
                title: `Quiz: ${topic.title}`,
                type: "quiz",
                durationMinutes: 15,
                description: `Check ${topic.title}`,
                learningObjectives: topic.learningObjectives.slice(0, 1),
              },
            ],
          })),
        };

        const finalized = await finalize(JSON.stringify(payload), "gemini");
        if (!finalized.ok) {
          return {
            ok: false,
            reason: finalized.reason,
            message: finalized.message,
            attempts: [{ provider: "gemini", reason: finalized.reason, message: finalized.message }],
          };
        }
        return {
          ok: true,
          provider: "gemini",
          model: "gemini-test",
          data: finalized.data,
        };
      });

      const input = buildTestOnboardingInput({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
        durationWeeks: 8,
      });

      const result = await generateRoadmapForOnboarding(input, TWIN_ID, START);
      expect(result.source).toBe("ai");
      expect(result.roadmap.knowledgeGraphId).toBe("kg-python");
      expect(result.roadmap.tasks[0]?.canonicalTopicId).toBeTruthy();
    });
  });
});

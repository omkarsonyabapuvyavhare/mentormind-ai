import { describe, expect, it } from "vitest";

import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import {
  REQUIRED_LESSON_KNOWLEDGE_CHECKS,
} from "@/lib/ai/lesson-schema";
import {
  GENERIC_EXERCISE_PATTERNS,
  looksLikeCode,
  looksLikeCommand,
  looksLikeConfiguration,
  looksLikeQuery,
  validateLessonPracticalBlocks,
} from "@/lib/ai/lesson-practical-validation";
import { enrichLessonWithPracticalBlocks, lessonHasPracticalBlocks } from "@/lib/learn/enrich-lesson-practical";

const pythonInput = {
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python",
  goalCategory: "Programming" as const,
  topicId: "python-syntax-data-types",
  topicTitle: "Python Syntax and Basic Data Types",
  skillLevel: "beginner" as const,
  learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
};

const sqlInput = {
  goalId: "master-sql",
  goalSlug: "master-sql",
  goalTitle: "Master SQL",
  goalCategory: "Data" as const,
  topicId: "sql-joins",
  topicTitle: "SQL JOINs",
  skillLevel: "intermediate" as const,
  learningObjectives: ["Write INNER and LEFT JOINs", "Explain join cardinality"],
};

const kubernetesInput = {
  goalId: "learn-kubernetes",
  goalSlug: "learn-kubernetes",
  goalTitle: "Learn Kubernetes",
  goalCategory: "DevOps" as const,
  topicId: "kubernetes-networking",
  topicTitle: "Kubernetes Networking",
  skillLevel: "intermediate" as const,
  learningObjectives: ["Explain Pod networking", "Configure Services"],
};

const businessInput = {
  goalId: "product-management",
  goalSlug: "product-management",
  goalTitle: "Product Management Foundations",
  goalCategory: "Business" as const,
  topicId: "stakeholder-alignment",
  topicTitle: "Stakeholder Alignment",
  skillLevel: "intermediate" as const,
  learningObjectives: ["Map stakeholders", "Run a decision review", "Document trade-offs"],
};

describe("lesson practical artifacts", () => {
  it("Python fallback includes code, expected output, and a bug-fix exercise", () => {
    const { lesson } = createDeterministicLessonForLearner(pythonInput);

    expect(lesson.practicalArtifact.type).toBe("code");
    expect(looksLikeCode(lesson.practicalArtifact.content)).toBe(true);
    expect(lesson.practicalArtifact.expectedOutput).toBeTruthy();
    expect(lesson.practicalArtifact.content).toMatch(/print\(/);
    expect(lesson.handsOnExercise.starterContent).toBeTruthy();
    expect(lesson.handsOnExercise.instructions.join(" ")).toMatch(/fix|bug|correct/i);
    expect(GENERIC_EXERCISE_PATTERNS.some((pattern) => pattern.test(lesson.handsOnExercise.instructions.join(" ")))).toBe(false);

    const knowledgeChecks = lesson.sections.reduce(
      (total, section) => total + section.knowledgeCheck.length,
      0,
    );
    expect(knowledgeChecks).toBe(REQUIRED_LESSON_KNOWLEDGE_CHECKS);
  });

  it("SQL fallback includes query artifact, expected rows, and query exercise", () => {
    const { lesson } = createDeterministicLessonForLearner(sqlInput);

    expect(["query", "code"]).toContain(lesson.practicalArtifact.type);
    expect(looksLikeQuery(lesson.practicalArtifact.content)).toBe(true);
    expect(lesson.practicalArtifact.expectedOutput).toBeTruthy();
    expect(lesson.handsOnExercise.instructions.join(" ")).toMatch(/query|join|change|compare/i);
  });

  it("Kubernetes fallback includes YAML or kubectl artifact and configuration exercise", () => {
    const { lesson } = createDeterministicLessonForLearner(kubernetesInput);

    const artifactText = lesson.practicalArtifact.content;
    expect(
      looksLikeConfiguration(artifactText) ||
        looksLikeCommand(artifactText) ||
        lesson.practicalArtifact.type === "configuration" ||
        lesson.practicalArtifact.type === "command",
    ).toBe(true);
    expect(lesson.practicalArtifact.expectedOutput).toBeTruthy();
    expect(lesson.handsOnExercise.instructions.join(" ")).toMatch(/manifest|verification|apply|configuration|command/i);
  });

  it("non-code topic uses workflow or case-study artifact without fabricated code", () => {
    const { lesson } = createDeterministicLessonForLearner(businessInput);

    expect(["workflow", "case-study", "diagram", "calculation"]).toContain(lesson.practicalArtifact.type);
    expect(looksLikeCode(lesson.practicalArtifact.content)).toBe(false);
    expect(validateLessonPracticalBlocks(lesson, {
      goalCategory: businessInput.goalCategory,
      topicId: businessInput.topicId,
      topicTitle: businessInput.topicTitle,
      learningObjectives: businessInput.learningObjectives,
    })).toBeNull();
  });

  it("enriches legacy cached lessons missing practical blocks", () => {
    const legacyLesson = {
      topicId: pythonInput.topicId,
      source: "cache" as const,
      title: pythonInput.topicTitle,
      estimatedMinutes: 45,
      learningObjectives: pythonInput.learningObjectives,
      sections: createDeterministicLessonForLearner(pythonInput).lesson.sections,
    };

    expect(lessonHasPracticalBlocks(legacyLesson)).toBe(false);

    const enriched = enrichLessonWithPracticalBlocks(legacyLesson, pythonInput);

    expect(lessonHasPracticalBlocks(enriched)).toBe(true);
    expect(enriched.practicalArtifact.content.length).toBeGreaterThan(0);
    expect(enriched.handsOnExercise.instructions.length).toBeGreaterThan(0);
  });

  it("rejects lessons without actionable hands-on exercises", () => {
    const { lesson } = createDeterministicLessonForLearner(pythonInput);
    const invalid = {
      ...lesson,
      handsOnExercise: {
        ...lesson.handsOnExercise,
        instructions: ["Write a summary of what you learned."],
      },
    };

    expect(
      validateLessonPracticalBlocks(invalid, {
        goalCategory: pythonInput.goalCategory,
        topicId: pythonInput.topicId,
        topicTitle: pythonInput.topicTitle,
        learningObjectives: pythonInput.learningObjectives,
      }),
    ).toContain("concrete action");
  });
});

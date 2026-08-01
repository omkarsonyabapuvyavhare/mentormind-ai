import { describe, expect, it } from "vitest";

import {
  buildKgAssessment,
  buildKgLesson,
  buildKgRoadmap,
} from "@/knowledge-base/generation";
import {
  goKnowledgeGraph,
  javaKnowledgeGraph,
  javascriptKnowledgeGraph,
  pythonKnowledgeGraph,
  typescriptKnowledgeGraph,
} from "@/knowledge-base/programming";
import { matchTopic, resolveKnowledgeGraph } from "@/knowledge-base/registry";
import {
  detectDomainContamination,
  validateAssessmentAgainstKg,
  validateLessonAgainstKg,
} from "@/knowledge-base/validation";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";
import {
  HANDS_ON_PRACTICE_HEADING,
  estimateWordCount,
} from "@/lib/ai/lesson-schema";
import { ensureKgLessonPassesLiveGates } from "@/lib/knowledge-graph/ensure-kg-lesson";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";

const DOMAIN_JOURNEYS = [
  {
    phrase: "I want to learn Java",
    category: "Programming" as const,
    graphId: "kg-java",
    graph: javaKnowledgeGraph,
  },
  {
    phrase: "I want to learn Python",
    category: "Programming" as const,
    graphId: "kg-python",
    graph: pythonKnowledgeGraph,
  },
  {
    phrase: "I want to learn JavaScript",
    category: "Programming" as const,
    graphId: "kg-javascript",
    graph: javascriptKnowledgeGraph,
  },
  {
    phrase: "I want to learn TypeScript",
    category: "Programming" as const,
    graphId: "kg-typescript",
    graph: typescriptKnowledgeGraph,
  },
  {
    phrase: "I want to learn Go",
    category: "Programming" as const,
    graphId: "kg-go",
    graph: goKnowledgeGraph,
  },
  {
    phrase: "I want to learn SQL",
    category: "Data" as const,
    graphId: "kg-sql",
    graph: sqlKnowledgeGraph,
  },
  {
    phrase: "I want to learn React",
    category: "Web Development" as const,
    graphId: "kg-react",
    graph: reactKnowledgeGraph,
  },
  {
    phrase: "I want to learn Kubernetes",
    category: "DevOps" as const,
    graphId: "kg-kubernetes",
    graph: kubernetesKnowledgeGraph,
  },
  {
    phrase: "I want to learn Data Engineering",
    category: "Data" as const,
    graphId: "kg-data-engineering",
    graph: dataEngineeringKnowledgeGraph,
  },
] as const;

describe("domain resolution journeys", () => {
  it.each(DOMAIN_JOURNEYS.map((entry) => [entry.graphId, entry] as const))(
    "resolves %s from free-form learn intent",
    (_id, journey) => {
      const intent = parseGoalIntentDeterministic(journey.phrase);
      expect(intent).not.toBeNull();

      const resolved = resolveKnowledgeGraph(
        intent!.goal,
        journey.category,
        [],
      );
      expect(resolved.status, resolved.reason).toBe("resolved");
      expect(resolved.graph?.id).toBe(journey.graphId);

      const roadmap = buildKgRoadmap({
        goalTitle: intent!.goal,
        goalCategory: journey.category,
        graph: journey.graph,
      });
      expect(roadmap.ok, roadmap.ok ? "" : roadmap.message ?? roadmap.reason).toBe(true);
      if (!roadmap.ok) return;
      expect(roadmap.knowledgeGraphId).toBe(journey.graphId);

      const firstTopic = [...journey.graph.topics].sort(
        (a, b) => a.learningOrder - b.learningOrder,
      )[0]!;

      const lesson = buildKgLesson({
        topicId: firstTopic.id,
        knowledgeGraphId: journey.graphId,
        goalTitle: intent!.goal,
        goalCategory: journey.category,
        graph: journey.graph,
      });
      expect(lesson.ok, lesson.ok ? "" : lesson.reason).toBe(true);
      if (!lesson.ok) return;
      expect(lesson.knowledgeGraphId).toBe(journey.graphId);

      const assessment = buildKgAssessment({
        topicId: firstTopic.id,
        knowledgeGraphId: journey.graphId,
        goalTitle: intent!.goal,
        goalCategory: journey.category,
        graph: journey.graph,
      });
      expect(assessment.ok, assessment.ok ? "" : assessment.reason).toBe(true);
      if (!assessment.ok) return;
      expect(assessment.knowledgeGraphId).toBe(journey.graphId);
      expect(assessment.questions).toHaveLength(5);
    },
  );

  it("never resolves Learn Java to Python", () => {
    for (const title of [
      "I want to learn Java",
      "Learn Java",
      "Java",
      "java programming",
      "Become a Java developer",
    ]) {
      const resolved = resolveKnowledgeGraph(title, "Programming");
      expect(resolved.status, `${title}: ${resolved.reason}`).toBe("resolved");
      expect(resolved.graph?.id).toBe("kg-java");
      expect(resolved.graph?.id).not.toBe("kg-python");
      expect(resolved.graph?.id).not.toBe("kg-javascript");
    }
  });

  it("keeps Java / JavaScript / TypeScript / Python / Go mutually exclusive", () => {
    expect(resolveKnowledgeGraph("Learn JavaScript", "Programming").graph?.id).toBe(
      "kg-javascript",
    );
    expect(resolveKnowledgeGraph("Learn TypeScript", "Programming").graph?.id).toBe(
      "kg-typescript",
    );
    expect(resolveKnowledgeGraph("Learn Python", "Programming").graph?.id).toBe("kg-python");
    expect(resolveKnowledgeGraph("Learn Go", "Programming").graph?.id).toBe("kg-go");
    expect(resolveKnowledgeGraph("Learning goal planning", "Unknown").graph?.id).not.toBe(
      "kg-go",
    );
  });

  it("does not match Java focus titles onto the Python graph", () => {
    const match = matchTopic(pythonKnowledgeGraph, "Java Syntax and Data Types");
    expect(match.topic).toBeNull();
    expect(match.reason.toLowerCase()).toMatch(/conflict|domain/);
  });

  it("rejects Python contamination inside a Java lesson payload", () => {
    const topic = javaKnowledgeGraph.topics[0]!;
    const issues = detectDomainContamination({
      content: "def greet():\n  print('hello')\n# python django flask",
      goalCategory: "Programming",
      graph: javaKnowledgeGraph,
      topic,
    });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => /python|contamination|cross-domain/i.test(issue.reason))).toBe(
      true,
    );
  });
});

describe("KG lesson Coursera-style structure", () => {
  it("builds one coherent lesson structure with 5 checks for Java syntax", () => {
    const topic = javaKnowledgeGraph.topics.find((entry) => entry.id === "java-syntax-and-types")!;
    const result = buildKgLesson({
      topicId: topic.id,
      knowledgeGraphId: "kg-java",
      goalTitle: "Learn Java",
      goalCategory: "Programming",
      graph: javaKnowledgeGraph,
    });
    expect(result.ok, result.ok ? "" : result.reason).toBe(true);
    if (!result.ok) return;

    const headings = result.lesson.sections.map((section) => section.heading);
    expect(headings).toEqual([
      "Lesson Overview",
      "Core Concepts",
      "Practical Example",
      HANDS_ON_PRACTICE_HEADING,
      "Common Mistakes",
      "Mentor Tips",
      "Key Takeaways",
    ]);
    expect(new Set(headings).size).toBe(headings.length);

    const checkCount = result.lesson.sections.reduce(
      (total, section) => total + section.knowledgeCheck.length,
      0,
    );
    expect(checkCount).toBe(5);

    const words = estimateWordCount(result.lesson);
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(2200);

    // Core Concepts must mention multiple concepts; other sections must not be per-concept mini-lessons.
    const core = result.lesson.sections.find((section) => section.heading === "Core Concepts")!;
    expect(core.content).toMatch(/main Method/i);
    expect(core.content).toMatch(/Primitive Types/i);

    const validation = validateLessonAgainstKg({
      goalTitle: "Learn Java",
      goalCategory: "Programming",
      topicTitle: topic.title,
      lesson: result.lesson,
      graph: javaKnowledgeGraph,
    });
    expect(validation.ok, validation.reasons.join("; ")).toBe(true);
    expect(validation.knowledgeGraphId).toBe("kg-java");

    const live = ensureKgLessonPassesLiveGates({
      topicId: topic.id,
      knowledgeGraphId: "kg-java",
      goalTitle: "Learn Java",
      goalCategory: "Programming",
      goalSlug: "learn-java",
      topicTitle: topic.title,
      graph: javaKnowledgeGraph,
    });
    expect(live.ok, live.ok ? "" : live.reason).toBe(true);
    if (live.ok) {
      expect(live.knowledgeGraphId).toBe("kg-java");
    }

    const assessment = buildKgAssessment({
      topicId: topic.id,
      knowledgeGraphId: "kg-java",
      goalTitle: "Learn Java",
      goalCategory: "Programming",
      graph: javaKnowledgeGraph,
    });
    expect(assessment.ok).toBe(true);
    if (!assessment.ok) return;
    const assessmentValidation = validateAssessmentAgainstKg({
      goalTitle: "Learn Java",
      goalCategory: "Programming",
      topicTitle: topic.title,
      questions: assessment.questions,
      graph: javaKnowledgeGraph,
    });
    expect(assessmentValidation.ok, assessmentValidation.reasons.join("; ")).toBe(true);
  });
});

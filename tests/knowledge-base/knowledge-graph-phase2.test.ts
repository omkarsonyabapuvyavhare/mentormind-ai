import { describe, expect, it } from "vitest";

import { dockerKnowledgeGraph } from "@/knowledge-base/cloud-devops/docker";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import {
  buildKgAssessment,
  buildKgLesson,
  buildKgRoadmap,
} from "@/knowledge-base/generation";
import { javaKnowledgeGraph, javascriptKnowledgeGraph, pythonKnowledgeGraph } from "@/knowledge-base/programming";
import {
  resolveKnowledgeGraph,
} from "@/knowledge-base/registry";
import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import { cybersecurityKnowledgeGraph } from "@/knowledge-base/security-architecture/cybersecurity";
import { promptEngineeringKnowledgeGraph } from "@/knowledge-base/security-architecture/prompt-engineering";
import {
  validateAssessmentAgainstKg,
  validateLessonAgainstKg,
  validateRoadmapAgainstKg,
} from "@/knowledge-base/validation";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";

const PRIMARY_CASES: Array<{
  graph: KnowledgeGraph;
  goalTitle: string;
}> = [
  { graph: pythonKnowledgeGraph, goalTitle: "Learn Python" },
  { graph: sqlKnowledgeGraph, goalTitle: "Learn SQL" },
  { graph: reactKnowledgeGraph, goalTitle: "Learn React" },
  { graph: kubernetesKnowledgeGraph, goalTitle: "Learn Kubernetes" },
  { graph: dataEngineeringKnowledgeGraph, goalTitle: "Learn Data Engineering" },
];

const STARTER_CASES: Array<{
  graph: KnowledgeGraph;
  goalTitle: string;
}> = [
  { graph: javascriptKnowledgeGraph, goalTitle: "Learn JavaScript" },
  { graph: javaKnowledgeGraph, goalTitle: "Learn Java" },
  { graph: dockerKnowledgeGraph, goalTitle: "Learn Docker" },
  { graph: cybersecurityKnowledgeGraph, goalTitle: "Learn Cybersecurity" },
  { graph: promptEngineeringKnowledgeGraph, goalTitle: "Learn Prompt Engineering" },
];

function assertNoAwsVpcLeakage(text: string) {
  expect(text.toLowerCase()).not.toMatch(/\b(aws|vpc|ec2|saa-c03)\b/);
}

describe("knowledge graph phase 2 starters", () => {
  it.each(STARTER_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "%s parses as a coherent 6+ topic curriculum",
    (_id, { graph }) => {
      expect(() => knowledgeGraphSchema.parse(graph)).not.toThrow();
      expect(graph.topics.length).toBeGreaterThanOrEqual(6);
      for (const topic of graph.topics) {
        expect(topic.title.toLowerCase()).not.toMatch(/core techniques|foundations$/);
        expect(topic.assessmentSkills.length).toBeGreaterThanOrEqual(5);
        expect(topic.concepts.length).toBeGreaterThanOrEqual(4);
      }
    },
  );

  it.each(STARTER_CASES.map((entry) => [entry.goalTitle, entry] as const))(
    "resolves %s to the starter graph",
    (goalTitle, { graph }) => {
      const resolved = resolveKnowledgeGraph(goalTitle, graph.category);
      expect(resolved.status).toBe("resolved");
      expect(resolved.graph?.id).toBe(graph.id);
    },
  );
});

describe("buildKgRoadmap", () => {
  it.each(PRIMARY_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "builds prerequisite-ordered roadmap for %s",
    (_id, { graph, goalTitle }) => {
      const result = buildKgRoadmap({
        goalTitle,
        goalCategory: graph.category,
        graph,
      });
      expect(result.ok, result.ok ? "" : result.message).toBe(true);
      if (!result.ok) return;

      expect(result.knowledgeGraphId).toBe(graph.id);
      expect(result.topics.length).toBe(graph.topics.length);
      expect(new Set(result.topics.map((topic) => topic.canonicalTopicId)).size).toBe(
        graph.topics.length,
      );

      for (let i = 1; i < result.topics.length; i += 1) {
        expect(result.topics[i]!.learningOrder).toBeGreaterThanOrEqual(
          result.topics[i - 1]!.learningOrder,
        );
      }

      const validation = validateRoadmapAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        graph,
        topics: result.topics.map((topic) => ({ title: topic.canonicalTitle })),
      });
      expect(validation.ok, validation.reasons.join("; ")).toBe(true);
      assertNoAwsVpcLeakage(JSON.stringify(result));
    },
  );

  it("summarizes a usable Python milestone sequence", () => {
    const result = buildKgRoadmap({
      goalTitle: "Learn Python",
      goalCategory: "Programming",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.milestones[0]?.canonicalTopicId).toBe("python-syntax-and-data-types");
    expect(result.milestones[0]?.tasks.some((task) => task.type === "lesson")).toBe(true);
    expect(result.topics.map((topic) => topic.canonicalTitle).slice(0, 3)).toEqual([
      "Python Syntax and Data Types",
      "Control Flow",
      "Functions",
    ]);
  });

  it.each(STARTER_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "builds valid roadmap for starter %s",
    (_id, { graph, goalTitle }) => {
      const result = buildKgRoadmap({
        goalTitle,
        goalCategory: graph.category,
      });
      expect(result.ok, result.ok ? "" : result.message).toBe(true);
      if (!result.ok) return;
      expect(result.knowledgeGraphId).toBe(graph.id);
      const validation = validateRoadmapAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        graph,
        topics: result.topics.map((topic) => ({ title: topic.canonicalTitle })),
      });
      expect(validation.ok, validation.reasons.join("; ")).toBe(true);
    },
  );

  it("returns unsupported-curriculum for Basket Weaving Mastery without AWS mapping", () => {
    const result = buildKgRoadmap({
      goalTitle: "Basket Weaving Mastery",
      goalCategory: "Unknown",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unsupported-curriculum");
    expect(result.proposedGraphDraft?.suggestedTitle).toMatch(/basket weaving/i);
    expect(result.proposedGraphDraft?.notes.toLowerCase()).toMatch(/aws|vpc|foundations/);
    assertNoAwsVpcLeakage(JSON.stringify(result.proposedGraphDraft?.seedTopicTitles ?? []));
    const resolved = resolveKnowledgeGraph("Basket Weaving Mastery", "Unknown");
    expect(resolved.status).toBe("unsupported");
    expect(resolved.graph).toBeNull();
  });
});

describe("buildKgLesson", () => {
  it.each(PRIMARY_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "builds a KG-valid lesson for first topic of %s",
    (_id, { graph, goalTitle }) => {
      const topic = [...graph.topics].sort((a, b) => a.learningOrder - b.learningOrder)[0]!;
      const result = buildKgLesson({
        topicId: topic.id,
        knowledgeGraphId: graph.id,
        goalTitle,
        goalCategory: graph.category,
      });
      expect(result.ok, result.ok ? "" : result.reason).toBe(true);
      if (!result.ok) return;

      const validation = validateLessonAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        topicTitle: topic.title,
        lesson: result.lesson,
        graph,
      });
      expect(validation.ok, validation.reasons.join("; ")).toBe(true);
      expect(validation.knowledgeCheckCount).toBe(5);
      expect(result.lesson.title.toLowerCase()).not.toMatch(/foundations/);
      expect(JSON.stringify(result.lesson).toLowerCase()).not.toMatch(/explain key ideas/);
      assertNoAwsVpcLeakage(JSON.stringify(result.lesson));
    },
  );

  it.each(
    [
      javascriptKnowledgeGraph,
      dockerKnowledgeGraph,
    ].map((graph) => [graph.id, graph] as const),
  )("builds a KG-valid lesson for starter %s", (_id, graph) => {
    const topic = graph.topics[0]!;
    const result = buildKgLesson({
      topicId: topic.id,
      graph,
    });
    expect(result.ok, result.ok ? "" : result.reason).toBe(true);
    if (!result.ok) return;
    const validation = validateLessonAgainstKg({
      goalTitle: graph.title,
      goalCategory: graph.category,
      topicTitle: topic.title,
      lesson: result.lesson,
      graph,
    });
    expect(validation.ok, validation.reasons.join("; ")).toBe(true);
  });
});

describe("buildKgAssessment", () => {
  it.each(PRIMARY_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "builds a KG-valid assessment for first topic of %s",
    (_id, { graph, goalTitle }) => {
      const topic = [...graph.topics].sort((a, b) => a.learningOrder - b.learningOrder)[0]!;
      const result = buildKgAssessment({
        topicId: topic.id,
        knowledgeGraphId: graph.id,
        goalTitle,
        goalCategory: graph.category,
      });
      expect(result.ok, result.ok ? "" : result.reason).toBe(true);
      if (!result.ok) return;

      expect(result.questions).toHaveLength(5);
      const validation = validateAssessmentAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        topicTitle: topic.title,
        questions: result.questions,
        graph,
      });
      expect(validation.ok, validation.reasons.join("; ")).toBe(true);
      expect(validation.uniqueConceptIds.length).toBeGreaterThanOrEqual(4);
      expect(validation.questionTypes.length).toBeGreaterThanOrEqual(3);
      assertNoAwsVpcLeakage(JSON.stringify(result.questions));
    },
  );

  it.each(
    [
      javascriptKnowledgeGraph,
      dockerKnowledgeGraph,
    ].map((graph) => [graph.id, graph] as const),
  )("builds a KG-valid assessment for starter %s", (_id, graph) => {
    const topic = graph.topics[0]!;
    const result = buildKgAssessment({
      topicId: topic.id,
      graph,
    });
    expect(result.ok, result.ok ? "" : result.reason).toBe(true);
    if (!result.ok) return;
    const validation = validateAssessmentAgainstKg({
      goalTitle: graph.title,
      goalCategory: graph.category,
      topicTitle: topic.title,
      questions: result.questions,
      graph,
    });
    expect(validation.ok, validation.reasons.join("; ")).toBe(true);
  });
});

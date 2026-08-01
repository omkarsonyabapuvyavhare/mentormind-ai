import { describe, expect, it } from "vitest";

import { awsSaaKnowledgeGraph } from "@/knowledge-base/cloud-devops/aws-saa";
import { azureAz900KnowledgeGraph } from "@/knowledge-base/cloud-devops/azure-az900";
import { dockerKnowledgeGraph } from "@/knowledge-base/cloud-devops/docker";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { dataScienceKnowledgeGraph } from "@/knowledge-base/data-ai/data-science";
import { machineLearningKnowledgeGraph } from "@/knowledge-base/data-ai/machine-learning";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import {
  buildKgAssessment,
  buildKgLesson,
  buildKgRoadmap,
} from "@/knowledge-base/generation";
import {
  javaKnowledgeGraph,
  javascriptKnowledgeGraph,
  pythonKnowledgeGraph,
  typescriptKnowledgeGraph,
} from "@/knowledge-base/programming";
import {
  KNOWLEDGE_GRAPH_REGISTRY,
  listKnowledgeGraphs,
  resolveKnowledgeGraph,
} from "@/knowledge-base/registry";
import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import { cybersecurityKnowledgeGraph } from "@/knowledge-base/security-architecture/cybersecurity";
import { systemDesignKnowledgeGraph } from "@/knowledge-base/security-architecture/system-design";
import {
  validateAssessmentAgainstKg,
  validateLessonAgainstKg,
  validateRoadmapAgainstKg,
} from "@/knowledge-base/validation";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";

/** Graphs that may ship with fewer than 6 topics (none expected after Phase 4). */
const TOPIC_COUNT_EXCEPTIONS = new Set<string>([]);

const PRIORITY_CASES: Array<{ graph: KnowledgeGraph; goalTitle: string }> = [
  { graph: pythonKnowledgeGraph, goalTitle: "Learn Python" },
  { graph: javascriptKnowledgeGraph, goalTitle: "Learn JavaScript" },
  { graph: javaKnowledgeGraph, goalTitle: "Learn Java" },
  { graph: typescriptKnowledgeGraph, goalTitle: "Learn TypeScript" },
  { graph: reactKnowledgeGraph, goalTitle: "Learn React" },
  { graph: sqlKnowledgeGraph, goalTitle: "Learn SQL" },
  { graph: dataScienceKnowledgeGraph, goalTitle: "Learn Data Science" },
  { graph: dataEngineeringKnowledgeGraph, goalTitle: "Learn Data Engineering" },
  { graph: machineLearningKnowledgeGraph, goalTitle: "Learn Machine Learning" },
  { graph: kubernetesKnowledgeGraph, goalTitle: "Learn Kubernetes" },
  { graph: dockerKnowledgeGraph, goalTitle: "Learn Docker" },
  { graph: awsSaaKnowledgeGraph, goalTitle: "AWS SAA" },
  { graph: azureAz900KnowledgeGraph, goalTitle: "AZ-900" },
  { graph: cybersecurityKnowledgeGraph, goalTitle: "Learn Cybersecurity" },
  { graph: systemDesignKnowledgeGraph, goalTitle: "Learn System Design" },
];

const PLACEHOLDER_TITLE =
  /core techniques|foundations$|^basics$|core concepts/i;

describe("knowledge graph phase 4 registry completeness", () => {
  it("registers every graph and each parses Zod", () => {
    const graphs = listKnowledgeGraphs();
    expect(graphs.length).toBeGreaterThanOrEqual(34);
    expect(graphs.length).toBe(KNOWLEDGE_GRAPH_REGISTRY.length);

    for (const graph of graphs) {
      expect(() => knowledgeGraphSchema.parse(graph), graph.id).not.toThrow();
      const minTopics = TOPIC_COUNT_EXCEPTIONS.has(graph.id) ? 1 : 6;
      expect(
        graph.topics.length,
        `${graph.id} topic count`,
      ).toBeGreaterThanOrEqual(minTopics);

      for (const topic of graph.topics) {
        expect(topic.title, `${graph.id}/${topic.id}`).not.toMatch(PLACEHOLDER_TITLE);
        expect(topic.concepts.length).toBeGreaterThanOrEqual(4);
        expect(topic.assessmentSkills.length).toBeGreaterThanOrEqual(5);
        expect(topic.exercises.length).toBeGreaterThanOrEqual(1);
        expect(topic.commonMistakes.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("keeps prerequisite references inside each graph and learningOrder sorted for buildKgRoadmap", () => {
    for (const graph of KNOWLEDGE_GRAPH_REGISTRY) {
      const ids = new Set(graph.topics.map((topic) => topic.id));
      for (const topic of graph.topics) {
        for (const prereq of topic.prerequisiteIds) {
          expect(ids.has(prereq), `${graph.id} missing prereq ${prereq}`).toBe(true);
        }
      }

      const roadmap = buildKgRoadmap({
        goalTitle: graph.title,
        goalCategory: graph.category,
        graph,
      });
      expect(
        roadmap.ok,
        `${graph.id}: ${roadmap.ok ? "" : roadmap.message ?? roadmap.reason}`,
      ).toBe(true);
      if (!roadmap.ok) continue;

      for (let i = 1; i < roadmap.topics.length; i += 1) {
        expect(roadmap.topics[i]!.learningOrder).toBeGreaterThanOrEqual(
          roadmap.topics[i - 1]!.learningOrder,
        );
      }
    }
  });
});

describe("phase 4 resolve aliases", () => {
  it.each([
    ["Learn Python", "Programming", "kg-python"],
    ["Learn TypeScript", "Programming", "kg-typescript"],
    ["Learn Go", "Programming", "kg-go"],
    ["Learn React", "Web Development", "kg-react"],
    ["Learn Next.js", "Web Development", "kg-nextjs"],
    ["Learn SQL", "Data", "kg-sql"],
    ["Learn Data Science", "Data", "kg-data-science"],
    ["Learn Machine Learning", "AI / Machine Learning", "kg-machine-learning"],
    ["AWS SAA", "Cloud", "kg-aws-saa"],
    ["saa-c03", "Cloud", "kg-aws-saa"],
    ["AZ-900", "Cloud", "kg-azure-az900"],
    ["Azure Fundamentals", "Cloud", "kg-azure-az900"],
    ["Learn Docker", "DevOps", "kg-docker"],
    ["Learn Kubernetes", "DevOps", "kg-kubernetes"],
    ["Learn System Design", "General Technology", "kg-system-design"],
    ["Learn Cybersecurity", "Cybersecurity", "kg-cybersecurity"],
  ] as const)("resolves %s", (title, category, graphId) => {
    const result = resolveKnowledgeGraph(title, category);
    expect(result.status, result.reason).toBe("resolved");
    expect(result.graph?.id).toBe(graphId);
  });

  it("does not false-positive short go alias on unrelated titles", () => {
    const result = resolveKnowledgeGraph("Learning goal planning", "Unknown");
    expect(result.graph?.id === "kg-go").toBe(false);
  });

  it("keeps arbitrary unsupported topics unsupported", () => {
    const result = resolveKnowledgeGraph("Learn Quantum Circuit Design", "Unknown");
    expect(result.status).toBe("unsupported");
    expect(result.graph).toBeNull();
  });
});

describe("phase 4 prioritized buildKg generators", () => {
  it.each(PRIORITY_CASES.map((entry) => [entry.graph.id, entry] as const))(
    "%s builds roadmap, lesson, and 5-question assessment",
    (_id, { graph, goalTitle }) => {
      const roadmap = buildKgRoadmap({
        goalTitle,
        goalCategory: graph.category,
        graph,
      });
      expect(roadmap.ok, roadmap.ok ? "" : roadmap.message ?? roadmap.reason).toBe(true);
      if (!roadmap.ok) return;

      const validation = validateRoadmapAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        graph,
        topics: roadmap.topics.map((topic) => ({ title: topic.canonicalTitle })),
      });
      expect(validation.ok, validation.reasons.join("; ")).toBe(true);

      const firstTopic = graph.topics
        .slice()
        .sort((a, b) => a.learningOrder - b.learningOrder)[0]!;

      const lesson = buildKgLesson({
        topicId: firstTopic.id,
        knowledgeGraphId: graph.id,
        goalTitle,
        goalCategory: graph.category,
        graph,
      });
      expect(lesson.ok, lesson.ok ? "" : lesson.reason).toBe(true);
      if (!lesson.ok) return;

      const lessonValidation = validateLessonAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        topicTitle: firstTopic.title,
        lesson: lesson.lesson,
        graph,
      });
      expect(lessonValidation.ok, lessonValidation.reasons.join("; ")).toBe(true);

      const assessment = buildKgAssessment({
        topicId: firstTopic.id,
        knowledgeGraphId: graph.id,
        goalTitle,
        goalCategory: graph.category,
        graph,
      });
      expect(assessment.ok, assessment.ok ? "" : assessment.reason).toBe(true);
      if (!assessment.ok) return;
      expect(assessment.questions).toHaveLength(5);

      const assessmentValidation = validateAssessmentAgainstKg({
        goalTitle,
        goalCategory: graph.category,
        topicTitle: firstTopic.title,
        questions: assessment.questions,
        graph,
      });
      expect(assessmentValidation.ok, assessmentValidation.reasons.join("; ")).toBe(true);
    },
  );
});

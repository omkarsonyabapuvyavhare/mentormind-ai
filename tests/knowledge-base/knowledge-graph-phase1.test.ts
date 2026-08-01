import { describe, expect, it } from "vitest";

import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { pythonKnowledgeGraph } from "@/knowledge-base/programming/python";
import {
  PRIMARY_KNOWLEDGE_GRAPHS,
  resolveKnowledgeGraph,
} from "@/knowledge-base/registry";
import { knowledgeGraphSchema } from "@/knowledge-base/schema";
import {
  detectDomainContamination,
  validateAssessmentAgainstKg,
  validateLessonAgainstKg,
  validateRoadmapAgainstKg,
} from "@/knowledge-base/validation";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";
import type { AiLessonResponse } from "@/lib/ai/lesson-schema";

function orderedTitles(graph: (typeof pythonKnowledgeGraph), count = 5): string[] {
  return [...graph.topics]
    .sort((a, b) => a.learningOrder - b.learningOrder)
    .slice(0, count)
    .map((topic) => topic.title);
}

function makeLesson(topicTitle: string, conceptTitles: string[]): AiLessonResponse {
  const checks = conceptTitles.slice(0, 5).map((concept, index) => ({
    question: `Which statement about ${concept} in ${topicTitle} is correct?`,
    options: [
      `${concept} is applied correctly in this domain`,
      "Unrelated AWS VPC subnet sizing",
      "Skip practice and only memorize slogans",
      "Use an unrelated React hook here",
    ] as [string, string, string, string],
    correctIndex: 0 as const,
    explanation: `${concept} is a core idea in ${topicTitle}.`,
    conceptTag: concept.toLowerCase().replace(/\s+/g, "-").slice(0, 32),
  }));

  // Distribute exactly 5 checks across sections (some sections empty).
  const sectionChecks: AiLessonResponse["sections"][number]["knowledgeCheck"][] = [
    [checks[0]!],
    [checks[1]!],
    [checks[2]!],
    [checks[3]!, checks[4]!],
    [],
    [],
  ];

  return {
    title: `${topicTitle}: guided practice`,
    estimatedMinutes: 25,
    learningObjectives: [
      `Apply ${conceptTitles[0]}`,
      `Explain ${conceptTitles[1]}`,
    ],
    practicalArtifact: {
      type: "code",
      title: `${topicTitle} worked example`,
      language: "text",
      content: `Example covering ${conceptTitles.slice(0, 3).join(", ")}`,
      expectedOutput: "Domain-correct output",
      explanation: `Connects to ${conceptTitles[0]} and ${conceptTitles[1]}.`,
    },
    handsOnExercise: {
      instructions: [`Practice ${conceptTitles[0]} with a small task.`],
      hints: ["Stay in-domain", "Check expected output"],
      expectedOutcome: `Working example of ${conceptTitles[0]}`,
      solutionExplanation: `Uses ${conceptTitles[0]} correctly.`,
    },
    sections: Array.from({ length: 6 }, (_, index) => ({
      heading: `${topicTitle} section ${index + 1}`,
      content: `Detailed guidance on ${conceptTitles[index % conceptTitles.length]} within ${topicTitle}.`,
      practicalExample: `Worked micro-example for ${conceptTitles[index % conceptTitles.length]}.`,
      commonMistakes: [
        `Misusing ${conceptTitles[0]} in ${topicTitle}`,
        `Skipping validation around ${conceptTitles[1] ?? conceptTitles[0]}`,
        "Copying unrelated cloud VPC examples into this lesson",
      ],
      summary: [
        `Remember ${conceptTitles[0]}`,
        `Practice ${conceptTitles[1] ?? conceptTitles[0]}`,
        `Avoid out-of-domain examples`,
      ],
      knowledgeCheck: sectionChecks[index] ?? [],
    })),
  };
}

function makeAssessmentQuestions(
  topicId: string,
  conceptIds: string[],
  options?: { sameCorrectIndex?: boolean; contaminateAws?: boolean },
) {
  const types = [
    "concept-understanding",
    "code-interpretation",
    "debugging",
    "expected-output",
    "practical-scenario",
  ] as const;

  return conceptIds.slice(0, 5).map((conceptId, index) => ({
    id: `${topicId}-q${index + 1}`,
    question: options?.contaminateAws
      ? `How does ${conceptId} relate to VPC subnet routing in AWS?`
      : `For ${conceptId}, which option best describes the correct behavior in scenario ${index + 1}?`,
    options: [
      `Correct behavior for ${conceptId}`,
      `Incorrect alternative A for ${conceptId}`,
      `Incorrect alternative B for ${conceptId}`,
      `Incorrect alternative C for ${conceptId}`,
    ] as [string, string, string, string],
    correctIndex: (options?.sameCorrectIndex ? 0 : index % 4) as 0 | 1 | 2 | 3,
    explanation: `Because ${conceptId} works that way.`,
    conceptId,
    difficulty: "beginner" as const,
    questionType: types[index]!,
    sourceTopicId: topicId,
    prerequisiteIds: [],
  }));
}

describe("knowledge graph phase 1 schemas", () => {
  it("parses all primary graphs", () => {
    for (const graph of PRIMARY_KNOWLEDGE_GRAPHS) {
      expect(() => knowledgeGraphSchema.parse(graph)).not.toThrow();
      expect(graph.topics.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("python syntax topic includes required concepts", () => {
    const topic = pythonKnowledgeGraph.topics.find(
      (entry) => entry.id === "python-syntax-and-data-types",
    );
    expect(topic).toBeTruthy();
    const titles = new Set(topic!.concepts.map((concept) => concept.title.toLowerCase()));
    for (const required of [
      "variables",
      "assignment",
      "integers",
      "floats",
      "strings",
      "booleans",
      "type conversion",
      "print",
      "comments",
      "indentation",
    ]) {
      expect(titles.has(required)).toBe(true);
    }
  });
});

describe("registry resolve", () => {
  it.each([
    ["Learn Python", "Programming", "kg-python"],
    ["Learn SQL", "Data", "kg-sql"],
    ["Learn React", "Web Development", "kg-react"],
    ["Learn Kubernetes", "DevOps", "kg-kubernetes"],
    ["Learn Data Engineering", "Data", "kg-data-engineering"],
  ] as const)("resolves %s", (title, category, graphId) => {
    const result = resolveKnowledgeGraph(title, category);
    expect(result.status).toBe("resolved");
    expect(result.graph?.id).toBe(graphId);
  });

  it("does not map an unsupported future topic to AWS/VPC", () => {
    const result = resolveKnowledgeGraph("Learn Quantum Circuit Design", "Unknown");
    expect(result.status).toBe("unsupported");
    expect(result.graph).toBeNull();
    expect(result.reason.toLowerCase()).toMatch(/refusing unrelated defaults|no high-confidence/);
  });
});

describe("roadmap validation", () => {
  it("accepts prerequisite-ordered topics for each primary graph", () => {
    const cases = [
      pythonKnowledgeGraph,
      sqlKnowledgeGraph,
      reactKnowledgeGraph,
      kubernetesKnowledgeGraph,
      dataEngineeringKnowledgeGraph,
    ];

    for (const graph of cases) {
      const result = validateRoadmapAgainstKg({
        goalTitle: graph.title,
        goalCategory: graph.category,
        graph,
        topics: orderedTitles(graph, 5).map((title) => ({ title })),
      });
      expect(result.ok, `${graph.id}: ${result.reasons.join("; ")}`).toBe(true);
      expect(result.normalizedTopics).toHaveLength(5);
      expect(result.normalizedTopics[0]?.knowledgeGraphId).toBe(graph.id);
    }
  });

  it("rejects duplicate topics", () => {
    const result = validateRoadmapAgainstKg({
      goalTitle: "Learn Python",
      goalCategory: "Programming",
      graph: pythonKnowledgeGraph,
      topics: [
        { title: "Python Syntax and Data Types" },
        { title: "Python Syntax and Data Types" },
        { title: "Control Flow" },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.some((reason) => /duplicate/i.test(reason))).toBe(true);
  });

  it("rejects unrelated topics and does not rewrite them to VPC", () => {
    const result = validateRoadmapAgainstKg({
      goalTitle: "Learn Python",
      goalCategory: "Programming",
      graph: pythonKnowledgeGraph,
      topics: [
        { title: "Python Syntax and Data Types" },
        { title: "VPC Subnets and Route Tables" },
        { title: "Control Flow" },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.join(" ").toLowerCase()).toMatch(/unrelated|contamination|aws|vpc/);
    expect(result.normalizedTopics.every((topic) => topic.canonicalTopicId !== "vpc-networking")).toBe(
      true,
    );
  });

  it("rejects prerequisite order violations", () => {
    const result = validateRoadmapAgainstKg({
      goalTitle: "Learn SQL",
      goalCategory: "Data",
      graph: sqlKnowledgeGraph,
      topics: [{ title: "JOINs" }, { title: "SELECT and FROM" }],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.some((reason) => /prerequisite/i.test(reason))).toBe(true);
  });
});

describe("lesson validation", () => {
  it("accepts a lesson with concept coverage and five checks", () => {
    const topic = pythonKnowledgeGraph.topics[0]!;
    const lesson = makeLesson(
      topic.title,
      topic.concepts.map((concept) => concept.title),
    );
    // Remove AWS contamination from mistake text for the happy path.
    lesson.sections = lesson.sections.map((section) => ({
      ...section,
      commonMistakes: [
        `Misusing ${topic.concepts[0]!.title}`,
        topic.commonMistakes[0]?.mistake ?? "Skipping indentation practice",
        topic.commonMistakes[1]?.mistake ?? "Mixing tabs and spaces",
      ],
      knowledgeCheck: section.knowledgeCheck.map((check) => ({
        ...check,
        options: [
          check.options[0],
          "An incorrect in-domain alternative",
          "Another incorrect in-domain alternative",
          "A third incorrect in-domain alternative",
        ],
      })),
    }));

    const result = validateLessonAgainstKg({
      goalTitle: "Learn Python",
      goalCategory: "Programming",
      topicTitle: topic.title,
      lesson,
      graph: pythonKnowledgeGraph,
    });
    expect(result.ok, result.reasons.join("; ")).toBe(true);
    expect(result.knowledgeCheckCount).toBe(5);
    expect(result.coveredConceptIds.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects domain contamination in lessons", () => {
    const topic = sqlKnowledgeGraph.topics[1]!;
    const lesson = makeLesson(
      topic.title,
      topic.concepts.map((concept) => concept.title),
    );
    lesson.sections[0]!.content += " Also configure an AWS VPC and EC2 security group.";

    const result = validateLessonAgainstKg({
      goalTitle: "Learn SQL",
      goalCategory: "Data",
      topicTitle: topic.title,
      lesson,
      graph: sqlKnowledgeGraph,
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.join(" ").toLowerCase()).toMatch(/aws|vpc|contamination/);
  });
});

describe("assessment diversity", () => {
  it("accepts five diverse questions across concepts/types", () => {
    const topic = reactKnowledgeGraph.topics[0]!;
    const questions = makeAssessmentQuestions(
      topic.id,
      topic.concepts.map((concept) => concept.id),
    );
    const result = validateAssessmentAgainstKg({
      goalTitle: "Learn React",
      goalCategory: "Web Development",
      topicTitle: topic.title,
      questions,
      graph: reactKnowledgeGraph,
    });
    expect(result.ok, result.reasons.join("; ")).toBe(true);
    expect(result.uniqueConceptIds.length).toBeGreaterThanOrEqual(4);
  });

  it("rejects same correctIndex pattern and AWS leakage", () => {
    const topic = kubernetesKnowledgeGraph.topics[0]!;
    const sameIndex = validateAssessmentAgainstKg({
      goalTitle: "Learn Kubernetes",
      goalCategory: "DevOps",
      topicTitle: topic.title,
      questions: makeAssessmentQuestions(
        topic.id,
        topic.concepts.map((concept) => concept.id),
        { sameCorrectIndex: true },
      ),
      graph: kubernetesKnowledgeGraph,
    });
    expect(sameIndex.ok).toBe(false);
    expect(sameIndex.reasons.some((reason) => /same index/i.test(reason))).toBe(true);

    const contaminated = validateAssessmentAgainstKg({
      goalTitle: "Learn Data Engineering",
      goalCategory: "Data",
      topicTitle: dataEngineeringKnowledgeGraph.topics[0]!.title,
      questions: makeAssessmentQuestions(
        dataEngineeringKnowledgeGraph.topics[0]!.id,
        dataEngineeringKnowledgeGraph.topics[0]!.concepts.map((concept) => concept.id),
        { contaminateAws: true },
      ),
      graph: dataEngineeringKnowledgeGraph,
    });
    expect(contaminated.ok).toBe(false);
    expect(contaminated.reasons.join(" ").toLowerCase()).toMatch(/aws|vpc/);
  });
});

describe("domain contamination helper", () => {
  it("flags AWS/VPC outside cloud graphs", () => {
    const issues = detectDomainContamination({
      content: "Design a VPC with public and private subnets on EC2.",
      goalCategory: "Programming",
      graph: pythonKnowledgeGraph,
    });
    expect(issues.length).toBeGreaterThan(0);
  });
});

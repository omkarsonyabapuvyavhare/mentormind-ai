import { describe, expect, it } from "vitest";

import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import {
  buildDeterministicAssessmentQuestions,
  buildDeterministicTopicAssessment,
} from "@/lib/assessment/assessment-fallback";
import {
  isGenericMetaAssessmentQuestion,
  normalizeQuestionStem,
  stemsAreNearDuplicates,
  validateAssessmentQuestionQuality,
} from "@/lib/assessment/assessment-question-quality";
import { TARGET_ASSESSMENT_QUESTIONS } from "@/lib/assessment/assessment-schema";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";

function assertDistinctAssessment(
  questions: Array<{ prompt: string; conceptTag: string }>,
): void {
  expect(questions).toHaveLength(TARGET_ASSESSMENT_QUESTIONS);
  const stems = questions.map((question) => normalizeQuestionStem(question.prompt));
  expect(new Set(stems).size).toBe(TARGET_ASSESSMENT_QUESTIONS);

  for (let i = 0; i < questions.length; i += 1) {
    expect(isGenericMetaAssessmentQuestion(questions[i]!.prompt)).toBe(false);
    expect(questions[i]!.prompt).not.toMatch(/which statement best reflects/i);
    expect(questions[i]!.prompt).not.toMatch(/lesson overview/i);
    for (let j = i + 1; j < questions.length; j += 1) {
      expect(stemsAreNearDuplicates(questions[i]!.prompt, questions[j]!.prompt)).toBe(false);
    }
  }

  expect(new Set(questions.map((question) => question.conceptTag)).size).toBeGreaterThanOrEqual(4);
}

describe("distinct technical assessment questions", () => {
  it("SQL Query Basics yields 5 distinct technical stems including query interpretation", () => {
    const { lesson } = createDeterministicLessonForLearner({
      goalId: "master-sql",
      goalSlug: "master-sql",
      goalTitle: "I want to learn SQL",
      goalCategory: "Data",
      topicId: "query-basics",
      topicTitle: "Query Basics",
      skillLevel: "beginner",
      learningObjectives: [
        "Write SELECT and FROM clauses",
        "Filter rows with WHERE",
        "Sort results with ORDER BY",
      ],
    });

    const assessment = buildAssessmentFromLesson(lesson as GeneratedLessonPayload, {
      goalSlug: "master-sql",
      goalCategory: "Data",
    });

    assertDistinctAssessment(assessment.questions);
    expect(
      assessment.questions.some(
        (question) =>
          /select|where|order by|join|query|expected outcome|sql/i.test(question.prompt) ||
          question.conceptTag.includes("artifact") ||
          question.conceptTag.includes("exercise"),
      ),
    ).toBe(true);
    expect(JSON.stringify(assessment.questions.map((question) => question.prompt))).not.toMatch(
      /which statement best reflects/i,
    );
    expect(
      assessment.questions.every(
        (question) =>
          !/lesson overview/i.test(question.prompt) &&
          !question.options.some((option) => /lesson overview/i.test(option)),
      ),
    ).toBe(true);
  });

  it("Python Syntax assessment includes code-reading or bug-fix coverage", () => {
    const { lesson } = createDeterministicLessonForLearner({
      goalId: "learn-python",
      goalSlug: "learn-python",
      goalTitle: "Learn Python",
      goalCategory: "Programming",
      topicId: "python-syntax-data-types",
      topicTitle: "Python Syntax and Basic Data Types",
      skillLevel: "beginner",
      learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
    });

    const assessment = buildAssessmentFromLesson(lesson as GeneratedLessonPayload, {
      goalSlug: "learn-python",
      goalCategory: "Programming",
    });

    assertDistinctAssessment(assessment.questions);
    expect(
      assessment.questions.some(
        (question) =>
          /print|type\(|assignment|variable|starter|hands-on|code|expected/i.test(question.prompt) ||
          /artifact|exercise/i.test(question.conceptTag),
      ),
    ).toBe(true);
  });

  it("Kubernetes assessment includes YAML/command/behavior coverage", () => {
    const { lesson } = createDeterministicLessonForLearner({
      goalId: "learn-kubernetes",
      goalSlug: "learn-kubernetes",
      goalTitle: "Learn Kubernetes",
      goalCategory: "DevOps",
      topicId: "kubernetes-networking",
      topicTitle: "Kubernetes Networking",
      skillLevel: "intermediate",
      learningObjectives: ["Explain Pod networking", "Configure Services"],
    });

    const assessment = buildAssessmentFromLesson(lesson as GeneratedLessonPayload, {
      goalSlug: "learn-kubernetes",
      goalCategory: "DevOps",
    });

    assertDistinctAssessment(assessment.questions);
    expect(
      assessment.questions.some(
        (question) =>
          /yaml|kubectl|manifest|replica|configuration|deployment|service|pod/i.test(
            `${question.prompt} ${question.conceptTag}`,
          ),
      ),
    ).toBe(true);
  });

  it("non-code topic yields five distinct scenario/workflow questions without fabricated code stems", () => {
    const assessment = buildDeterministicTopicAssessment({
      topicId: "stakeholder-alignment",
      topicTitle: "Stakeholder Alignment",
      goalSlug: "product-management",
      goalCategory: "Business",
      learningObjectives: ["Map stakeholders", "Run a decision review", "Document trade-offs"],
      sections: [
        {
          heading: "Core Explanation",
          content: "Stakeholder alignment requires explicit decision criteria and trade-off records.",
          summary: ["Document decisions with owners and constraints"],
          commonMistakes: ["Assuming silence means agreement"],
        },
        {
          heading: "Key Takeaways",
          content: "Decision reviews catch conflicting priorities early.",
          summary: ["Run a short decision review before committing scope"],
          commonMistakes: ["Skipping the review under schedule pressure"],
        },
      ],
      practicalArtifact: {
        type: "case-study",
        title: "Decision review scenario",
        content: "A team must choose between speed and validation under a launch deadline.",
        explanation: "Validation checkpoints reduce user-visible defects with modest delay.",
      },
      handsOnExercise: {
        instructions: ["List stakeholders", "Record one trade-off", "State the decision owner"],
        hints: ["Name the constraint that forces the trade-off"],
        expectedOutcome: "A documented decision with owner and rejected alternative",
        solutionExplanation: "Explicit ownership prevents silent disagreement.",
      },
    });

    assertDistinctAssessment(assessment.questions);
    expect(assessment.questions.every((question) => !/```|def |SELECT /.test(question.prompt))).toBe(
      true,
    );
  });

  it("rejects five repeated AI questions and rebuilds a distinct fallback set", () => {
    const repeated = {
      question: "In Query Basics, which statement best reflects: \"Explain key ideas in Query Basics\"?",
      options: [
        "lesson overview",
        "Using the wrong syntax for lesson overview in this context",
        "Applying an operator that does not match the Query Basics data type here",
        "Confusing lesson overview with an unrelated concept from another topic",
      ] as [string, string, string, string],
      correctIndex: 0,
      explanation: "Generic.",
      conceptTag: "explain-key-ideas",
    };

    const badLesson = {
      topicId: "query-basics",
      source: "ai" as const,
      title: "Query Basics",
      estimatedMinutes: 45,
      learningObjectives: ["Explain key ideas in Query Basics", "Write SELECT queries", "Filter with WHERE"],
      practicalArtifact: {
        type: "query" as const,
        title: "Sample SELECT",
        language: "sql",
        content: "SELECT name FROM customers WHERE active = 1;",
        expectedOutput: "name\nAlice\nBob",
        explanation: "SELECT projects columns and WHERE filters rows.",
      },
      handsOnExercise: {
        instructions: ["Rewrite the query to sort by name", "Compare the result set"],
        hints: ["Use ORDER BY"],
        expectedOutcome: "Rows sorted alphabetically by name",
        solution: "SELECT name FROM customers WHERE active = 1 ORDER BY name;",
        solutionExplanation: "ORDER BY sorts the filtered result set.",
      },
      sections: Array.from({ length: 5 }, (_, index) => ({
        heading: ["Lesson Overview", "Core Explanation", "Hands-on Practice", "Practical Example", "Key Takeaways"][
          index
        ]!,
        content: "SQL Query Basics covers SELECT, WHERE, and ORDER BY with verifiable result sets.",
        practicalExample: "SELECT name FROM customers WHERE active = 1;",
        commonMistakes: ["Forgetting the FROM clause", "Filtering after aggregation incorrectly"],
        summary: ["SELECT chooses columns", "WHERE filters rows", "ORDER BY sorts output"],
        knowledgeCheck: [{ ...repeated, conceptTag: `dup-${index}` }],
      })),
    } satisfies GeneratedLessonPayload;

    const assessment = buildAssessmentFromLesson(badLesson, {
      goalSlug: "master-sql",
      goalCategory: "Data",
    });

    expect(validateAssessmentQuestionQuality(assessment.questions)).toBeNull();
    assertDistinctAssessment(assessment.questions);
    expect(assessment.source).toBe("fallback");
  });

  it("deterministic builder never emits the old generic objective template", () => {
    const questions = buildDeterministicAssessmentQuestions({
      topicId: "query-basics",
      topicTitle: "Query Basics",
      goalSlug: "master-sql",
      goalCategory: "Data",
      learningObjectives: ["Explain key ideas in Query Basics", "Write SELECT and FROM"],
      sections: [
        {
          heading: "Core Explanation",
          content: "SELECT projects columns; FROM identifies the source table.",
          summary: ["SELECT and FROM define the base result set"],
          commonMistakes: ["Omitting FROM"],
        },
      ],
      practicalArtifact: {
        type: "query",
        title: "Basic SELECT",
        language: "sql",
        content: "SELECT id, name FROM users;",
        expectedOutput: "id | name\n1 | Ada",
        explanation: "The query returns the selected columns from users.",
      },
      count: 5,
    });

    expect(JSON.stringify(questions)).not.toMatch(/which statement best reflects/i);
    expect(JSON.stringify(questions)).not.toMatch(/unrelated concept from another topic/i);
    assertDistinctAssessment(questions);
  });
});

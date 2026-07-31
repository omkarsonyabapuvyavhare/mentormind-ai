// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  filterValidLessonQuestions,
  isGenericMetaAssessmentQuestion,
  isGenericStudyAdviceQuestion,
  selectDiverseAssessmentQuestions,
  stemsAreNearDuplicates,
  validateAssessmentQuestionQuality,
} from "@/lib/assessment/assessment-question-quality";
import { assessmentQuestionSchema } from "@/lib/assessment/assessment-schema";

function sampleQuestion(prompt: string, conceptTag: string, options = ["A", "B", "C", "D"]) {
  return assessmentQuestionSchema.parse({
    id: `q-${conceptTag}`,
    topicId: "demo-topic",
    conceptTag,
    prompt,
    options: options as [string, string, string, string],
    correctIndex: 0,
    explanation: "Because A is correct.",
  });
}

describe("assessment question quality", () => {
  it("flags generic study-advice prompts", () => {
    expect(isGenericStudyAdviceQuestion("What is the best way to study Java?")).toBe(true);
    expect(
      isGenericStudyAdviceQuestion("Which declaration correctly creates an integer variable in Java?"),
    ).toBe(false);
  });

  it("flags the old generic objective template", () => {
    expect(
      isGenericMetaAssessmentQuestion(
        'In Query Basics, which statement best reflects: "Explain key ideas in Query Basics"?',
      ),
    ).toBe(true);
  });

  it("detects near-duplicate stems with topic-name substitution", () => {
    expect(
      stemsAreNearDuplicates(
        "Which statement about Query Basics is correct?",
        "Which statement about Query Basics is correct?",
      ),
    ).toBe(true);
  });

  it("filters generic study-advice questions", () => {
    const filtered = filterValidLessonQuestions([
      sampleQuestion("What is the best next step?", "study-advice"),
      sampleQuestion("Which Azure service model gives the most control over the OS?", "iaas"),
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.conceptTag).toBe("iaas");
  });

  it("selects diverse questions by concept tag and rejects duplicate stems", () => {
    const selected = selectDiverseAssessmentQuestions(
      [
        sampleQuestion("Question one about SELECT", "concept-a"),
        sampleQuestion("Question one about SELECT", "concept-a-dup"),
        sampleQuestion("Question two about WHERE", "concept-b"),
        sampleQuestion("Question three about ORDER BY", "concept-c"),
        sampleQuestion("Question four about aliases", "concept-d"),
        sampleQuestion("Question five about joins", "concept-e"),
        sampleQuestion("Question six about indexes", "concept-f"),
      ],
      5,
    );

    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((question) => question.conceptTag)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(selected.map((question) => question.prompt)).size).toBe(5);
  });

  it("validateAssessmentQuestionQuality rejects repeated generic sets", () => {
    const repeated = Array.from({ length: 5 }, (_, index) =>
      sampleQuestion(
        'In Query Basics, which statement best reflects: "Explain key ideas in Query Basics"?',
        `tag-${index}`,
        [
          "lesson overview",
          "Using the wrong syntax for lesson overview in this context",
          "Applying an operator that does not match the Query Basics data type here",
          "Confusing lesson overview with an unrelated concept from another topic",
        ],
      ),
    );

    expect(validateAssessmentQuestionQuality(repeated)).not.toBeNull();
  });
});

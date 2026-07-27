// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  filterValidLessonQuestions,
  isGenericStudyAdviceQuestion,
  selectDiverseAssessmentQuestions,
} from "@/lib/assessment/assessment-question-quality";
import { assessmentQuestionSchema } from "@/lib/assessment/assessment-schema";

function sampleQuestion(prompt: string, conceptTag: string) {
  return assessmentQuestionSchema.parse({
    id: `q-${conceptTag}`,
    topicId: "demo-topic",
    conceptTag,
    prompt,
    options: ["A", "B", "C", "D"] as [string, string, string, string],
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

  it("filters generic study-advice questions", () => {
    const filtered = filterValidLessonQuestions([
      sampleQuestion("What is the best next step?", "study-advice"),
      sampleQuestion("Which Azure service model gives the most control over the OS?", "iaas"),
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.conceptTag).toBe("iaas");
  });

  it("selects diverse questions by concept tag", () => {
    const selected = selectDiverseAssessmentQuestions(
      [
        sampleQuestion("Question one", "concept-a"),
        sampleQuestion("Question two", "concept-b"),
        sampleQuestion("Question three", "concept-c"),
        sampleQuestion("Question four", "concept-d"),
        sampleQuestion("Question five", "concept-e"),
        sampleQuestion("Question six", "concept-f"),
      ],
      5,
    );

    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((question) => question.conceptTag)).size).toBeGreaterThanOrEqual(4);
  });
});

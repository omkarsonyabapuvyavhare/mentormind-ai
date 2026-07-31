import { describe, expect, it } from "vitest";

import { aiLessonResponseSchema } from "@/lib/ai/lesson-schema";
import {
  buildSystemPrompt,
  normalizeGeminiLessonPayload,
} from "@/lib/ai/generate-lesson";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

describe("normalizeGeminiLessonPayload", () => {
  it("maps answer → correctIndex and joins handsOnPractice array fields", () => {
    const base = buildMentorLessonFixture("Python Syntax");
    const drifted = {
      ...base,
      sections: base.sections.map((section, index) => {
        if (index === 0) {
          return {
            ...section,
            knowledgeCheck: [
              {
                question: "Which assigns 5 to count?",
                options: ["int count = 5;", "count := 5", "count = 5", "var count = 5"],
                answer: "count = 5",
              },
            ],
          };
        }

        if (section.heading === "Hands-on Practice") {
          return {
            ...section,
            practicalExample: undefined,
            handsOnPractice: {
              exercise: "Inventory script",
              instructions: ["Create item_name", "Print types"],
              thinkAbout: ["What type is inventory_value?"],
              hints: ["Use True capitalized"],
              expectedOutcome: "Types print correctly",
              solutionExplanation: "Python multiplies int and float to float.",
            },
            commonMistakes: section.commonMistakes,
            summary: section.summary,
            knowledgeCheck: [],
          };
        }

        return { ...section, knowledgeCheck: [] };
      }),
    };

    // Put one KC on sections 0-4 to keep count after normalize for schema of section 0 only.
    const normalized = normalizeGeminiLessonPayload(drifted) as typeof drifted;
    const firstKc = normalized.sections[0].knowledgeCheck[0] as {
      correctIndex: number;
      explanation: string;
      answer?: unknown;
    };
    expect(firstKc.correctIndex).toBe(2);
    expect(firstKc.explanation).toContain("count = 5");
    expect(firstKc.answer).toBeUndefined();

    const hop = normalized.sections.find((s) => s.heading === "Hands-on Practice")!;
    expect(typeof hop.practicalExample).toBe("string");
    expect(typeof hop.handsOnPractice?.instructions).toBe("string");
    expect(typeof hop.handsOnPractice?.thinkAbout).toBe("string");
    expect(hop.handsOnPractice?.instructions).toContain("Create item_name");
  });

  it("prompt requires correctIndex and string handsOnPractice fields", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("correctIndex");
    expect(prompt).toContain('NEVER use an "answer" field');
    expect(prompt).toContain("handsOnPractice.instructions MUST be a single string");
    expect(prompt).toContain("handsOnExercise.instructions MUST be a string array");
  });

  it("coerces handsOnExercise.instructions string into a string array", () => {
    const lesson = buildMentorLessonFixture("SQL SELECT");
    const drifted = {
      ...lesson,
      handsOnExercise: {
        ...lesson.handsOnExercise,
        instructions: "1. Write a SELECT\n2. Add a WHERE clause\n3. Run the query",
        hints: "Use column aliases",
      },
    };
    const normalized = normalizeGeminiLessonPayload(drifted) as typeof lesson;
    expect(Array.isArray(normalized.handsOnExercise.instructions)).toBe(true);
    expect(normalized.handsOnExercise.instructions.length).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(normalized.handsOnExercise.hints)).toBe(true);
  });

  it("normalized fixture still satisfies schema", () => {
    const lesson = buildMentorLessonFixture("Valid after normalize");
    const normalized = normalizeGeminiLessonPayload(lesson);
    expect(aiLessonResponseSchema.safeParse(normalized).success).toBe(true);
  });

  it("repairs the captured Gemini drift shape enough for Zod", () => {
    const drifted = {
      title: "Python Syntax and Basic Data Types",
      estimatedMinutes: 45,
      learningObjectives: ["Declare variables", "Identify types"],
      practicalArtifact: {
        type: "code",
        title: "Variables demo",
        language: "python",
        content: "count = 5\nprint(type(count))",
        expectedOutput: "<class 'int'>",
        explanation: "Assignment creates an int-bound name.",
      },
      handsOnExercise: {
        instructions: ["Create variables", "Print types"],
        hints: ["Capitalize True"],
        expectedOutcome: "Types print",
        solutionExplanation: "Python tracks types at runtime.",
      },
      sections: Array.from({ length: 8 }, (_, index) => {
        const headings = [
          "Lesson Overview",
          "Real-World Context",
          "Core Explanation",
          "Hands-on Practice",
          "Practical Example",
          "Common Misconceptions",
          "Mentor Tips",
          "Key Takeaways",
        ];
        const base = {
          heading: headings[index],
          content:
            "Python binds names to objects. Integers, floats, strings, and booleans are core built-in types used in every script. Assignment uses a single equals sign and does not declare a static type.",
          practicalExample: index === 3 ? undefined : "count = 5\nprint(count)",
          commonMistakes:
            index === 3
              ? ["Misspelling names", "Quoting True"]
              : [
                  "Using == for assignment",
                  "Declaring types like int x = 1",
                  "Forgetting quotes around strings",
                ],
          summary: [
            "Assignment uses =",
            "Types are runtime objects",
            "Booleans are True/False",
          ],
          knowledgeCheck:
            index < 5
              ? [
                  {
                    question: `Check ${index}: which assigns 5?`,
                    options: ["int count = 5;", "count := 5", "count = 5", "var count = 5"],
                    answer: "count = 5",
                  },
                ]
              : [],
        };

        if (index === 3) {
          return {
            ...base,
            handsOnPractice: {
              exercise: "Inventory script",
              instructions: ["Create item_name", "Print types"],
              thinkAbout: ["What type is inventory_value?"],
              hints: ["Use True"],
              expectedOutcome: "Types print",
              solutionExplanation: "Multiplying int and float yields float.",
            },
          };
        }

        return base;
      }),
    };

    const normalized = normalizeGeminiLessonPayload(drifted);
    const parsed = aiLessonResponseSchema.safeParse(normalized);
    expect(parsed.success, JSON.stringify(parsed.success ? [] : parsed.error.issues)).toBe(true);
  });
});

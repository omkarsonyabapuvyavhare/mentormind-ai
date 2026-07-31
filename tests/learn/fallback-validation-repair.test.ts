import { describe, expect, it } from "vitest";

import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import { buildDeterministicMentorLesson } from "@/lib/ai/lesson-mentor-fallback";
import {
  containsGenericLessonPhrases,
  containsLessonMetaLanguage,
  findLessonValidationIssues,
  REQUIRED_LESSON_KNOWLEDGE_CHECKS,
} from "@/lib/ai/lesson-schema";

describe("fallback validation repair", () => {
  it("never throws for AWS cloud-foundations seed content with roadmap phrasing", () => {
    expect(() =>
      createDeterministicLessonForLearner({
        goalId: "aws-saa-c03",
        goalSlug: "aws-saa-c03",
        goalTitle: "Pass AWS SAA",
        goalCategory: "Cloud",
        topicId: "cloud-foundations",
        topicTitle: "Cloud Foundations",
        skillLevel: "beginner",
      }),
    ).not.toThrow();

    const { lesson } = createDeterministicLessonForLearner({
      goalId: "aws-saa-c03",
      goalSlug: "aws-saa-c03",
      goalTitle: "Pass AWS SAA",
      goalCategory: "Cloud",
      topicId: "cloud-foundations",
      topicTitle: "Cloud Foundations",
      skillLevel: "beginner",
    });

    const body = JSON.stringify(lesson);
    expect(containsLessonMetaLanguage(body)).toBe(false);
    expect(containsGenericLessonPhrases(body)).toBe(false);
    expect(findLessonValidationIssues(lesson.sections)).toHaveLength(0);
  });

  it("repairs injected meta language instead of throwing", () => {
    const lesson = buildDeterministicMentorLesson(
      {
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        topicId: "python-syntax-data-types",
        topicTitle: "Python Syntax and Basic Data Types",
        skillLevel: "beginner",
        learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
        teachingSnippets: [
          {
            title: "Variables",
            body: "Today you will work through variable assignment. Your roadmap starts here.",
          },
        ],
      },
      "python-syntax-data-types",
    );

    const body = JSON.stringify(lesson);
    expect(body).toContain("Declare variables");
    expect(body).not.toMatch(/your roadmap/i);
    expect(body).not.toMatch(/today you will work through/i);
    expect(containsLessonMetaLanguage(body)).toBe(false);
    expect(findLessonValidationIssues(lesson.sections)).toHaveLength(0);
  });

  it("returns emergency technical lesson when repair cannot clear all violations", () => {
    const lesson = buildDeterministicMentorLesson(
      {
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        topicId: "python-syntax-data-types",
        topicTitle: "Python Syntax and Basic Data Types",
        skillLevel: "beginner",
        learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
        teachingSnippets: [
          {
            title: "Meta only",
            body: "Today you will work through your roadmap and your learning goal in this session focus: topic check-in.",
          },
        ],
        scenarioSeed: "Today you will work through your roadmap again.",
        takeawaySeed: "Your learning goal depends on your roadmap.",
      },
      "python-syntax-data-types",
    );

    const knowledgeChecks = lesson.sections.reduce(
      (total, section) => total + section.knowledgeCheck.length,
      0,
    );

    expect(knowledgeChecks).toBe(REQUIRED_LESSON_KNOWLEDGE_CHECKS);
    expect(lesson.sections).toHaveLength(8);
    expect(JSON.stringify(lesson)).toMatch(/int|float|bool|str|assignment|print\(/i);
    expect(containsLessonMetaLanguage(JSON.stringify(lesson))).toBe(false);
    expect(findLessonValidationIssues(lesson.sections)).toHaveLength(0);
  });

  it("Python fallback teaches topic concepts without echoing objectives", () => {
    const { lesson } = createDeterministicLessonForLearner({
      goalId: "learn-python",
      goalSlug: "learn-python",
      goalTitle: "Learn Python in 8 weeks",
      goalCategory: "Programming",
      topicId: "python-syntax-data-types",
      topicTitle: "Python Syntax and Basic Data Types",
      skillLevel: "beginner",
      learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
    });

    const body = JSON.stringify(lesson);
    expect(body).toMatch(/int|float|bool|str|assignment|print\(/i);
    expect(body).toContain("Python Syntax and Basic Data Types");
    expect(body).not.toMatch(/Declare variables: state the precise definition/i);
    expect(containsLessonMetaLanguage(body)).toBe(false);
    expect(containsGenericLessonPhrases(body)).toBe(false);
  });
});

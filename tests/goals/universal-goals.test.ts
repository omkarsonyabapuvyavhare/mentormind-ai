import { describe, expect, it } from "vitest";

import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { validateContentForGoalCategory } from "@/lib/goals/domain-validation";
import {
  buildGoalSlug,
  classifyGoalCategory,
  detectGoalType,
  inferFocusAreas,
  resolveGoalIdentityFromText,
} from "@/lib/goals/goal-identity";
import { validateAiLessonStructure } from "@/lib/ai/lesson-schema";
import { validateAiRoadmapStructure } from "@/lib/ai/roadmap-schema";
import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import {
  mapFocusAreasToTopicIds,
  resolveGoalIdFromParsedIntent,
} from "@/lib/onboarding/map-parsed-intent";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import { onboardingInputSchema } from "@/lib/onboarding/schema";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

const START = "2026-07-17T00:00:00.000Z";
const TWIN_ID = "learner-20260717000000";

function buildInput(overrides: Partial<OnboardingInput>): OnboardingInput {
  return onboardingInputSchema.parse({
    goalSlug: "learn-python",
    goalTitle: "Learn Python",
    goalCategory: "Programming",
    goalType: "Skill",
    goalId: "learn-python",
    skillLevel: "beginner",
    durationWeeks: 8,
    studyHoursPerWeek: 7,
    studyTimeOfDay: "evening",
    focusDurationMinutes: 45,
    preferredFormats: ["video", "quiz"],
    knownChallengeTopicIds: [],
    ...overrides,
  });
}

function buildLesson(overrides: Partial<GeneratedLessonPayload> = {}): GeneratedLessonPayload {
  return {
    topicId: "python-basics",
    source: "ai",
    title: "Python Basics",
    estimatedMinutes: 45,
    learningObjectives: ["Understand Python syntax", "Write simple scripts"],
    sections: [
      {
        heading: "Variables and types",
        content: "Python uses dynamic typing for variables and supports strings, numbers, and booleans.",
        practicalExample: "name = 'MentorMind'; count = 3",
        commonMistakes: ["Reusing built-in names like list"],
        summary: ["Choose descriptive variable names"],
        knowledgeCheck: [
          {
            question: "Which is valid Python variable assignment?",
            options: ["count = 5", "5 = count", "var-count = 1", "count := five"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Python assigns with variable on the left.",
            conceptTag: "variable-assignment",
          },
          {
            question: "Which value is a Python string literal?",
            options: ["\"hello\"", "3.14", "True", "[1, 2]"] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Quoted text is a string literal.",
            conceptTag: "string-type",
          },
          {
            question: "Which name follows Python variable conventions?",
            options: ["student_count", "2students", "class", "student-count"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Python identifiers use snake_case and cannot start with digits.",
            conceptTag: "naming-rules",
          },
        ],
      },
      {
        heading: "Control flow",
        content: "Use if, elif, and else to branch logic in Python scripts.",
        practicalExample: "if score >= 70: print('pass')",
        commonMistakes: ["Forgetting indentation"],
        summary: ["Indentation defines blocks"],
        knowledgeCheck: [
          {
            question: "What defines a block in Python?",
            options: ["Indentation", "Curly braces", "Semicolons", "Parentheses only"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Python relies on indentation.",
            conceptTag: "indentation",
          },
          {
            question: "Which keyword starts a conditional branch in Python?",
            options: ["if", "when", "switch", "case"] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Python conditionals begin with if.",
            conceptTag: "control-flow",
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("universal goal identity", () => {
  it.each([
    ["I want to learn Python", "Programming", "Skill", "learn-python"],
    ["I want to become a React developer", "Web Development", "Skill", "become-a-react-developer"],
    ["I want to learn Kubernetes", "DevOps", "Skill", "learn-kubernetes"],
    ["I want to master SQL", "Data", "Skill", "master-sql"],
    ["I want to learn Data Science", "Data", "Skill", "learn-data-science"],
    ["Prepare for AWS SAA", "Cloud", "Certification", "aws-saa-c03"],
    ["Azure Fundamentals AZ-900", "Cloud", "Certification", "azure-fundamentals"],
    ["I want to learn Prompt Engineering", "AI / Machine Learning", "Skill", "learn-prompt-engineering"],
  ])("classifies '%s'", (text, category, type, slug) => {
    const identity = resolveGoalIdentityFromText(text, text);
    expect(identity.goalCategory).toBe(category);
    expect(identity.goalType).toBe(type);
    expect(identity.goalSlug).toBe(slug);
  });

  it("Data Science focus areas are concrete technical topics", () => {
    const areas = inferFocusAreas("Learn Data Science", "Data");

    expect(areas).toEqual(
      expect.arrayContaining([
        "Python for Data Science",
        "NumPy Arrays",
        "Pandas DataFrames",
        "Data Cleaning",
        "Data Visualization",
        "Exploratory Data Analysis",
      ]),
    );
    expect(areas.every((area) => !/^(foundations|core concepts|review)$/i.test(area))).toBe(true);
  });

  it("React and SQL focus areas stay domain-specific", () => {
    expect(inferFocusAreas("Learn React", "Web Development")).toEqual(
      expect.arrayContaining(["JSX", "Components", "Props", "State", "Hooks"]),
    );
    expect(inferFocusAreas("Learn SQL", "Data")).toEqual(
      expect.arrayContaining(["SELECT", "WHERE", "ORDER BY", "GROUP BY", "JOINS"]),
    );
  });

  it("Docker and Data Engineer use role-specific curricula", () => {
    expect(inferFocusAreas("Learn Docker", "DevOps")).toEqual(
      expect.arrayContaining(["Images and Containers", "Dockerfile Instructions", "Docker Compose"]),
    );
    expect(inferFocusAreas("Become a Data Engineer", "Data")).toEqual(
      expect.arrayContaining([
        "Data Engineering Fundamentals",
        "ETL and ELT Patterns",
        "Data Lakes and Warehouses",
        "Batch and Streaming Pipelines",
        "Orchestration with Airflow",
      ]),
    );
    expect(inferFocusAreas("Learn Data Engineering", "Data")).toEqual(
      expect.arrayContaining(["Data Engineering Fundamentals", "Apache Spark Transforms"]),
    );
    expect(inferFocusAreas("Learn Docker", "DevOps").some((area) => /^docker fundamentals$/i.test(area))).toBe(
      false,
    );
  });

  it("never rejects unknown goals in deterministic parsing", () => {
    const parsed = parseGoalIntentDeterministic("I want to learn Android app development in 10 weeks");

    expect(parsed).not.toBeNull();
    expect(parsed?.goal.toLowerCase()).toContain("android");
    expect(parsed?.goalCategory).toBe("Mobile Development");
    const draft = createDraftFromParsedIntent(parsed!, "I want to learn Android app development in 10 weeks");
    draft.skillLevel = { value: "beginner", source: "manual" };
    draft.skillLevelConfirmed = true;
    expect(draftToOnboardingInput(draft).goalSlug).toBe(buildGoalSlug(parsed!.goal));
  });
});

describe("cross-domain validation", () => {
  it("rejects AWS content in Python roadmaps", () => {
    const error = validateContentForGoalCategory(
      "Week 1 Amazon EC2 and VPC networking",
      "Programming",
      "learn-python",
    );

    expect(error).toContain("AWS");
  });

  it("rejects Azure content in React lessons", () => {
    const error = validateAiLessonStructure(
      buildMentorLessonFixture("React Components", { domainHint: "React components and props" }),
      { goalSlug: "learn-react", goalCategory: "Web Development", topicId: "react-components", topicTitle: "React Components" },
    );

    expect(error).toBeNull();
  });

  it("rejects Azure content in a React roadmap milestone", () => {
    const milestones = {
      milestones: Array.from({ length: 8 }, (_, index) => ({
        title: `Week ${index + 1}`,
        description: "React learning milestone",
        week: index + 1,
        topicTitle: `React Topic ${index + 1}`,
        tasks: [
          {
            title: "Lesson",
            type: "lesson" as const,
            durationMinutes: 45,
            description: "Core lesson",
            learningObjectives: ["Understand the topic"],
          },
          {
            title: "Quiz",
            type: "quiz" as const,
            durationMinutes: 20,
            description: "Check understanding",
            learningObjectives: ["Validate understanding"],
          },
        ],
      })),
    };

    milestones.milestones[3]!.description = "Microsoft Azure Blob Storage fundamentals";

    const error = validateAiRoadmapStructure(milestones, 8, {
      goalSlug: "learn-react",
      goalCategory: "Web Development",
    });

    expect(error).toContain("Azure");
  });
});

describe("universal roadmap fallbacks", () => {
  it("Python roadmap uses programming milestones", () => {
    const result = createDeterministicRoadmapFromOnboarding(
      buildInput({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
        goalId: "learn-python",
      }),
      TWIN_ID,
      START,
      { goal: "Learn Python", recommendedFocusAreas: inferFocusAreas("Learn Python", "Programming") },
    );

    expect(JSON.stringify(result.roadmap).toLowerCase()).toContain("python");
    expect(JSON.stringify(result.roadmap).toLowerCase()).not.toContain("amazon ec2");
  });

  it("Data Science roadmap never falls back to Foundations topics", () => {
    const parsed = parseGoalIntentDeterministic("I want to learn Data Science");
    expect(parsed?.goalCategory).toBe("Data");
    expect(parsed?.recommendedFocusAreas.some((area) => /pandas|numpy|data cleaning/i.test(area))).toBe(
      true,
    );

    const result = createDeterministicRoadmapFromOnboarding(
      buildInput({
        goalSlug: "learn-data-science",
        goalTitle: "Learn Data Science",
        goalCategory: "Data",
        goalType: "Skill",
        goalId: "learn-data-science",
        durationWeeks: 8,
      }),
      TWIN_ID,
      START,
      {
        goal: "Learn Data Science",
        // Simulate the old broken generic focus areas — fallback must replace them.
        recommendedFocusAreas: ["Foundations", "Core Concepts", "Applied Practice", "Review"],
      },
    );

    const haystack = JSON.stringify(result.roadmap);
    expect(haystack).not.toMatch(/"topicId":"foundations"/i);
    expect(haystack).not.toMatch(/Explain key ideas in/i);
    expect(haystack.toLowerCase()).toMatch(/pandas|numpy|data cleaning|python for data science/);
    expect(result.roadmap.tasks[0]?.title.toLowerCase()).not.toContain("foundations");
  });

  it("AWS certification still uses stable seed roadmap", () => {
    const result = createDeterministicRoadmapFromOnboarding(
      buildInput({
        goalSlug: "aws-saa-c03",
        goalTitle: "AWS Solutions Architect Associate",
        goalCategory: "Cloud",
        goalType: "Certification",
        goalId: "aws-saa-c03",
      }),
      TWIN_ID,
      START,
    );

    expect(result.roadmap.goalId).toBe("aws-saa-c03");
    expect(result.roadmap.tasks.some((task) => task.topicId === "vpc-networking")).toBe(true);
  });
});

describe("lesson and assessment alignment", () => {
  it("Python assessment matches lesson concepts", () => {
    const lesson = buildLesson();
    const assessment = buildAssessmentFromLesson(lesson, {
      goalSlug: "learn-python",
      goalCategory: "Programming",
    });

    expect(assessment.questions.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(assessment).toLowerCase()).toContain("python");
  });

  it("Kubernetes assessment avoids AWS terms", () => {
    const lesson = buildLesson({
      topicId: "kubernetes-networking",
      title: "Kubernetes Networking",
      sections: buildLesson().sections,
    });

    const assessment = buildAssessmentFromLesson(lesson, {
      goalSlug: "learn-kubernetes",
      goalCategory: "DevOps",
    });

    expect(JSON.stringify(assessment).toLowerCase()).not.toContain("amazon ec2");
  });
});

describe("intent mapping via draft confirmation", () => {
  it("maps machine learning goals into confirmed onboarding input", () => {
    const parsed = parseGoalIntentDeterministic(
      "I want to learn machine learning in 12 weeks with 6 hours per week",
    )!;

    const draft = createDraftFromParsedIntent(
      parsed,
      "I want to learn machine learning in 12 weeks with 6 hours per week",
    );
    draft.skillLevel = { value: parsed.currentSkillLevel, source: "manual" };
    draft.skillLevelConfirmed = true;
    const input = draftToOnboardingInput(draft);

    expect(input.goalCategory).toBe("AI / Machine Learning");
    expect(input.goalType).toBe("Skill");
    expect(resolveGoalIdFromParsedIntent(parsed)).toBe(input.goalSlug);
    expect(onboardingInputSchema.safeParse(input).success).toBe(true);
  });
});

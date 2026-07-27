import { describe, expect, it, vi } from "vitest";

import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { mapFocusAreasToTopicIds } from "@/lib/onboarding/map-parsed-intent";
import {
  buildDefaultParsedIntent,
  parseGoalIntentDeterministic,
} from "@/lib/onboarding/parse-intent-deterministic";
import { universalOnboardingDefaults } from "@/lib/onboarding/schema";
import {
  fetchGeneratedLesson,
  resetLessonFetchDedupForTests,
} from "@/lib/learn/fetch-generated-lesson";
import type { GenerateLessonRequest } from "@/lib/learn/generate-lesson-request-schema";

const LESSON_REQUEST: GenerateLessonRequest = {
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python",
  goalCategory: "Programming",
  goalType: "Skill",
  topicId: "python-basics",
  topicTitle: "Python Basics",
  skillLevel: "beginner",
  durationMinutes: 45,
  preferredFormats: ["video", "quiz"],
};

const LESSON_API_BODY = {
  source: "deterministic" as const,
  lesson: {
    topicId: LESSON_REQUEST.topicId,
    source: "deterministic" as const,
    title: "Python Basics",
    estimatedMinutes: 45,
    learningObjectives: ["Understand Python syntax"],
    sections: [
      {
        heading: "Intro",
        content: "Python intro content here.",
        practicalExample: "print('hi')",
        commonMistakes: ["Indentation errors"],
        summary: ["Use spaces consistently"],
        knowledgeCheck: [
          {
            question: "Valid assignment?",
            options: ["x = 1", "1 = x", "x := y", "x - 1"] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Left side must be variable.",
          },
        ],
      },
    ],
  },
  fallbackReason: "missing-api-key",
};

describe("architecture remediation", () => {
  it("uses neutral universal onboarding defaults", () => {
    expect(universalOnboardingDefaults.goalSlug).toBe("learning-goal");
    expect(universalOnboardingDefaults.knownChallengeTopicIds).toEqual([]);
    expect(universalOnboardingDefaults.goalTitle).not.toMatch(/AWS/i);
  });

  it("empty parse fallback is neutral, not AWS", () => {
    const parsed = buildDefaultParsedIntent();
    expect(parsed.goal).toBe("Personal learning goal");
    expect(parsed.goalCategory).toBe("General Technology");
  });

  it.each([
    ["I want to learn Python", "Programming"],
    ["I want to become a React developer", "Web Development"],
    ["I want to learn Kubernetes", "DevOps"],
    ["I want to master SQL", "Data"],
    ["Prepare for Azure AZ-900", "Cloud"],
  ])("draft for '%s' has no AWS challenge ids", (text) => {
    const parsed = parseGoalIntentDeterministic(text)!;
    const draft = createDraftFromParsedIntent(parsed, text);

    expect(draft.knownChallengeTopicIds.value).toEqual([]);
    expect(draft.goalSlug).not.toBe("aws-saa-c03");
  });

  it("AWS draft keeps AWS identity without leaking into universal defaults", () => {
    const parsed = parseGoalIntentDeterministic("Prepare for AWS SAA")!;
    const draft = createDraftFromParsedIntent(parsed, "Prepare for AWS SAA");

    expect(draft.goalSlug).toBe("aws-saa-c03");
    expect(draft.knownChallengeTopicIds.value).toEqual([]);
  });

  it("onboarding input is only built after draft confirmation", () => {
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic("I want to learn Python")!,
      "I want to learn Python",
    );

    expect(() => draftToOnboardingInput(draft)).toThrow();

    draft.skillLevel = { value: "beginner", source: "manual" };
    draft.skillLevelConfirmed = true;

    const input = draftToOnboardingInput(draft);
    expect(input.goalSlug).toContain("python");
    expect(input.knownChallengeTopicIds).toEqual([]);
  });

  it("does not map Python focus areas to AWS topic ids", () => {
    const focusAreas = inferFocusAreas("Learn Python", "Programming");
    const topicIds = mapFocusAreasToTopicIds(focusAreas, "learn-python");

    expect(topicIds.join(" ")).not.toMatch(/vpc-networking|ec2-compute|s3-storage|iam-security/);
  });

  it("deduplicates in-flight lesson fetches for the same goal and topic", async () => {
    resetLessonFetchDedupForTests();

    let fetchCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        fetchCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          ok: true,
          json: async () => LESSON_API_BODY,
        } as Response;
      }),
    );

    const [first, second] = await Promise.all([
      fetchGeneratedLesson(LESSON_REQUEST),
      fetchGeneratedLesson(LESSON_REQUEST),
    ]);

    expect(first.topicId).toBe(LESSON_REQUEST.topicId);
    expect(second.topicId).toBe(LESSON_REQUEST.topicId);
    expect(fetchCount).toBe(1);

    vi.unstubAllGlobals();
    resetLessonFetchDedupForTests();
  });
});

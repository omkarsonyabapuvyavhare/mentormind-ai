import type { OnboardingInput } from "@/lib/onboarding/schema";

export function buildTestOnboardingInput(
  overrides: Partial<OnboardingInput> = {},
): OnboardingInput {
  const goalSlug = overrides.goalSlug ?? overrides.goalId ?? "aws-saa-c03";

  return {
    goalSlug,
    goalTitle: overrides.goalTitle ?? "AWS Solutions Architect Associate",
    goalCategory: overrides.goalCategory ?? "Cloud",
    goalType: overrides.goalType ?? "Certification",
    goalId: goalSlug,
    skillLevel: "intermediate",
    durationWeeks: 8,
    studyHoursPerWeek: 7,
    studyTimeOfDay: "evening",
    focusDurationMinutes: 45,
    preferredFormats: ["video", "lab", "quiz"],
    knownChallengeTopicIds: [],
    ...overrides,
  };
}

export const azureTestInput = buildTestOnboardingInput({
  goalSlug: "azure-fundamentals",
  goalTitle: "Azure Fundamentals AZ-900",
  goalCategory: "Cloud",
  goalType: "Certification",
  skillLevel: "beginner",
  durationWeeks: 6,
  studyHoursPerWeek: 8,
  preferredFormats: ["video", "quiz"],
});

export const customTestInput = buildTestOnboardingInput({
  goalSlug: "learn-kubernetes",
  goalTitle: "Learn Kubernetes",
  goalCategory: "DevOps",
  goalType: "Skill",
  skillLevel: "beginner",
  durationWeeks: 8,
  studyHoursPerWeek: 6,
  studyTimeOfDay: "morning",
  focusDurationMinutes: 30,
  preferredFormats: ["reading", "quiz"],
});

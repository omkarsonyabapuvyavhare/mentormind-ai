import { z } from "zod";

import { goalCategorySchema, goalTypeSchema } from "@/lib/goals/goal-identity";
import {
  learningFormatSchema,
  skillLevelSchema,
  studyTimeOfDaySchema,
} from "@/types/schemas";

export const onboardingInputSchema = z.object({
  goalSlug: z.string().min(1).max(64),
  goalTitle: z.string().min(1).max(200),
  goalCategory: goalCategorySchema,
  goalType: goalTypeSchema,
  /** Backward-compatible alias used by roadmap caches and APIs — mirrors goalSlug. */
  goalId: z.string().min(1).max(64),
  skillLevel: skillLevelSchema,
  durationWeeks: z.number().int().min(4).max(16),
  studyHoursPerWeek: z.number().min(1).max(40),
  studyTimeOfDay: studyTimeOfDaySchema,
  focusDurationMinutes: z.number().int().min(15).max(120),
  preferredFormats: z.array(learningFormatSchema).min(1),
  knownChallengeTopicIds: z.array(z.string().min(1)).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

/** Neutral defaults for universal goals — never AWS-specific. */
export const universalOnboardingDefaults: OnboardingInput = {
  goalSlug: "learning-goal",
  goalTitle: "Personal learning goal",
  goalCategory: "General Technology",
  goalType: "Skill",
  goalId: "learning-goal",
  skillLevel: "beginner",
  durationWeeks: 8,
  studyHoursPerWeek: 6,
  studyTimeOfDay: "evening",
  focusDurationMinutes: 45,
  preferredFormats: ["video", "quiz"],
  knownChallengeTopicIds: [],
};

/** AWS SAA seed defaults — use only for AWS certification tests and demo seeds. */
export const awsOnboardingDefaults: OnboardingInput = {
  goalSlug: "aws-saa-c03",
  goalTitle: "AWS Solutions Architect Associate",
  goalCategory: "Cloud",
  goalType: "Certification",
  goalId: "aws-saa-c03",
  skillLevel: "intermediate",
  durationWeeks: 8,
  studyHoursPerWeek: 24,
  studyTimeOfDay: "evening",
  focusDurationMinutes: 45,
  preferredFormats: ["video", "lab", "quiz"],
  knownChallengeTopicIds: ["vpc-networking"],
};

/** @deprecated Prefer `universalOnboardingDefaults` or `awsOnboardingDefaults` explicitly. */
export const onboardingDefaults = universalOnboardingDefaults;

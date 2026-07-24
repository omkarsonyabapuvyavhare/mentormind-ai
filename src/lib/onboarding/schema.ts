import { z } from "zod";

import { onboardingGoalTemplates } from "@/constants/onboarding";
import {
  learningFormatSchema,
  skillLevelSchema,
  studyTimeOfDaySchema,
} from "@/types/schemas";

const goalIds = onboardingGoalTemplates.map((goal) => goal.id) as [string, ...string[]];

export const onboardingInputSchema = z.object({
  goalId: z.enum(goalIds),
  skillLevel: skillLevelSchema,
  durationWeeks: z.number().int().min(4).max(16),
  studyHoursPerWeek: z.number().min(1).max(40),
  studyTimeOfDay: studyTimeOfDaySchema,
  focusDurationMinutes: z.number().int().min(15).max(120),
  preferredFormats: z.array(learningFormatSchema).min(1),
  knownChallengeTopicIds: z.array(z.string().min(1)).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

export const onboardingDefaults: OnboardingInput = {
  goalId: "aws-saa-c03",
  skillLevel: "intermediate",
  durationWeeks: 8,
  studyHoursPerWeek: 24,
  studyTimeOfDay: "evening",
  focusDurationMinutes: 45,
  preferredFormats: ["video", "lab", "quiz"],
  knownChallengeTopicIds: ["vpc-networking"],
};

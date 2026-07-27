import { z } from "zod";

import { fallbackReasonSchema } from "@/lib/api/fallback-reason";
import { goalCategorySchema, goalTypeSchema } from "@/lib/goals/goal-identity";
import { skillLevelSchema } from "@/types/schemas";

export const PARSED_DURATION_WEEKS_MIN = 4;
export const PARSED_DURATION_WEEKS_MAX = 16;
export const PARSED_STUDY_HOURS_MIN = 1;
export const PARSED_STUDY_HOURS_MAX = 40;

export const parsedGoalIntentSchema = z.object({
  goal: z.string().min(1),
  domain: z.string().min(1),
  goalCategory: goalCategorySchema,
  goalType: goalTypeSchema,
  currentSkillLevel: skillLevelSchema,
  targetOutcome: z.string().min(1),
  durationWeeks: z.number(),
  studyHoursPerWeek: z.number(),
  recommendedFocusAreas: z.array(z.string().min(1)).min(1).max(8),
});

export type ParsedGoalIntent = z.infer<typeof parsedGoalIntentSchema>;

export const parseIntentRequestSchema = z.object({
  text: z.string().max(4000),
});

export const parseIntentSourceSchema = z.enum(["ai", "deterministic"]);

export const parseIntentResponseSchema = z.object({
  source: parseIntentSourceSchema,
  parsed: parsedGoalIntentSchema,
  fallbackReason: fallbackReasonSchema,
});

export type ParseIntentSource = z.infer<typeof parseIntentSourceSchema>;
export type ParseIntentResponse = z.infer<typeof parseIntentResponseSchema>;

export function clampDurationWeeks(value: number): number {
  return Math.min(
    PARSED_DURATION_WEEKS_MAX,
    Math.max(PARSED_DURATION_WEEKS_MIN, Math.round(value)),
  );
}

export function clampStudyHoursPerWeek(value: number): number {
  return Math.min(
    PARSED_STUDY_HOURS_MAX,
    Math.max(PARSED_STUDY_HOURS_MIN, Math.round(value)),
  );
}

export function clampParsedGoalIntent(parsed: ParsedGoalIntent): ParsedGoalIntent {
  return {
    ...parsed,
    durationWeeks: clampDurationWeeks(parsed.durationWeeks),
    studyHoursPerWeek: clampStudyHoursPerWeek(parsed.studyHoursPerWeek),
  };
}

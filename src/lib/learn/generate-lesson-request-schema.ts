import { z } from "zod";

import { fallbackReasonSchema } from "@/lib/api/fallback-reason";
import {
  aiLessonResponseSchema,
  lessonGenerationSourceSchema,
} from "@/lib/ai/lesson-schema";
import { goalCategorySchema, goalTypeSchema } from "@/lib/goals/goal-identity";
import { learningFormatSchema, skillLevelSchema } from "@/types/schemas";

export const generateLessonRequestSchema = z.object({
  goalId: z.string().min(1),
  goalSlug: z.string().min(1).max(64),
  goalTitle: z.string().min(1).max(500),
  goalCategory: goalCategorySchema,
  goalType: goalTypeSchema,
  topicId: z.string().min(1),
  topicTitle: z.string().min(1).max(200),
  skillLevel: skillLevelSchema,
  durationMinutes: z.number().int().min(5).max(180),
  learningObjectives: z.array(z.string().min(1).max(200)).max(6).optional(),
  preferredFormats: z.array(learningFormatSchema).min(1),
});

export const generateLessonResponseSchema = z.object({
  source: lessonGenerationSourceSchema.exclude(["cache"]),
  lesson: aiLessonResponseSchema.extend({
    topicId: z.string().min(1),
  }),
  fallbackReason: fallbackReasonSchema,
  /** Optional development-only provenance; ignored by lesson rendering logic. */
  generationPath: z.enum(["ai", "deterministic", "emergency"]).optional(),
});

export type GenerateLessonRequest = z.infer<typeof generateLessonRequestSchema>;
export type GenerateLessonResponse = z.infer<typeof generateLessonResponseSchema>;

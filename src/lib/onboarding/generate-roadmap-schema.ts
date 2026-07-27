import { z } from "zod";

import { fallbackReasonSchema } from "@/lib/api/fallback-reason";
import { onboardingInputSchema } from "@/lib/onboarding/schema";
import { roadmapSchema } from "@/types/schemas";
import { roadmapGenerationSourceSchema } from "@/lib/ai/roadmap-schema";

export const roadmapGenerationContextSchema = z.object({
  goal: z.string().min(1).max(500).optional(),
  domain: z.string().min(1).max(200).optional(),
  targetOutcome: z.string().min(1).max(500).optional(),
  recommendedFocusAreas: z.array(z.string().min(1).max(200)).max(8).optional(),
});

export const generateRoadmapRequestSchema = z.object({
  input: onboardingInputSchema,
  twinId: z.string().min(1),
  startTimestamp: z.string().datetime(),
  context: roadmapGenerationContextSchema.optional(),
});

export const generateRoadmapResponseSchema = z.object({
  source: roadmapGenerationSourceSchema,
  roadmap: roadmapSchema,
  fallbackReason: fallbackReasonSchema,
});

export type GenerateRoadmapRequest = z.infer<typeof generateRoadmapRequestSchema>;
export type GenerateRoadmapResponse = z.infer<typeof generateRoadmapResponseSchema>;

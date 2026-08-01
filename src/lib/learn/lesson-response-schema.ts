import { z } from "zod";

import {
  aiLessonResponseSchema,
  lessonGenerationSourceSchema,
} from "@/lib/ai/lesson-schema";

export const generatedLessonSchema = aiLessonResponseSchema.extend({
  topicId: z.string().min(1),
  source: lessonGenerationSourceSchema,
  knowledgeGraphId: z.string().min(1).max(120).optional(),
  canonicalTopicId: z.string().min(1).max(120).optional(),
  kgValidationVersion: z.string().min(1).max(64).optional(),
});

export type GeneratedLessonPayload = z.infer<typeof generatedLessonSchema>;

import { z } from "zod";

import {
  aiLessonResponseSchema,
  lessonGenerationSourceSchema,
} from "@/lib/ai/lesson-schema";

export const generatedLessonSchema = aiLessonResponseSchema.extend({
  topicId: z.string().min(1),
  source: lessonGenerationSourceSchema,
});

export type GeneratedLessonPayload = z.infer<typeof generatedLessonSchema>;

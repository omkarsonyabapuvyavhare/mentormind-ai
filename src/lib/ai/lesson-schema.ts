import { z } from "zod";

import { validateContentForGoalCategory } from "@/lib/goals/domain-validation";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export const MAX_LESSON_SECTIONS = 6;
export const MAX_KNOWLEDGE_CHECKS_PER_SECTION = 3;
export const REQUIRED_LESSON_KNOWLEDGE_CHECKS = 5;
export const MAX_WORDS_ESTIMATE = 900;

export const knowledgeCheckSchema = z.object({
  question: z.string().min(1).max(300),
  options: z.tuple([
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
  ]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(400),
  conceptTag: z.string().min(1).max(64).optional(),
});

export const lessonSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  content: z.string().min(1).max(1200),
  practicalExample: z.string().min(1).max(500),
  commonMistakes: z.array(z.string().min(1).max(200)).min(1).max(4),
  summary: z.array(z.string().min(1).max(200)).min(1).max(4),
  knowledgeCheck: z.array(knowledgeCheckSchema).min(1).max(MAX_KNOWLEDGE_CHECKS_PER_SECTION),
});

export const aiLessonResponseSchema = z.object({
  title: z.string().min(1).max(200),
  estimatedMinutes: z.number().int().min(5).max(120),
  learningObjectives: z.array(z.string().min(1).max(200)).min(1).max(6),
  sections: z.array(lessonSectionSchema).min(1).max(MAX_LESSON_SECTIONS),
});

export type KnowledgeCheck = z.infer<typeof knowledgeCheckSchema>;
export type LessonSection = z.infer<typeof lessonSectionSchema>;
export type AiLessonResponse = z.infer<typeof aiLessonResponseSchema>;

export const lessonGenerationSourceSchema = z.enum(["ai", "deterministic", "cache"]);

export type LessonGenerationSource = z.infer<typeof lessonGenerationSourceSchema>;

export interface GeneratedLesson extends AiLessonResponse {
  topicId: string;
  source: LessonGenerationSource;
}

export function estimateWordCount(lesson: AiLessonResponse): number {
  const parts = [
    lesson.title,
    ...lesson.learningObjectives,
    ...lesson.sections.flatMap((section) => [
      section.heading,
      section.content,
      section.practicalExample,
      ...section.commonMistakes,
      ...section.summary,
      ...section.knowledgeCheck.flatMap((check) => [
        check.question,
        ...check.options,
        check.explanation,
      ]),
    ]),
  ];

  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export interface LessonValidationContext {
  goalSlug: string;
  goalCategory: GoalCategory;
}

export function validateAiLessonStructure(
  parsed: AiLessonResponse,
  context: LessonValidationContext,
): string | null {
  const wordCount = estimateWordCount(parsed);

  if (wordCount > MAX_WORDS_ESTIMATE) {
    return `Lesson exceeds ${MAX_WORDS_ESTIMATE} words (${wordCount}).`;
  }

  const knowledgeCheckCount = parsed.sections.reduce(
    (total, section) => total + section.knowledgeCheck.length,
    0,
  );

  if (knowledgeCheckCount !== REQUIRED_LESSON_KNOWLEDGE_CHECKS) {
    return `Lesson must include exactly ${REQUIRED_LESSON_KNOWLEDGE_CHECKS} knowledge checks (${knowledgeCheckCount} found).`;
  }

  const structureError = validateContentForGoalCategory(
    JSON.stringify(parsed),
    context.goalCategory,
    context.goalSlug,
  );

  if (structureError) {
    return structureError;
  }

  return null;
}

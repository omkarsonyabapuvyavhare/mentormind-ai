import { z } from "zod";

import { validateAssessmentQuestionQuality } from "@/lib/assessment/assessment-question-quality";
import { validateContentForGoalCategory } from "@/lib/goals/domain-validation";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import {
  assessmentSkillTypeSchema,
  difficultyLevelSchema,
} from "@/knowledge-base/schema";

export const TARGET_ASSESSMENT_QUESTIONS = 5;
export const MIN_ASSESSMENT_QUESTIONS = TARGET_ASSESSMENT_QUESTIONS;
export const MAX_ASSESSMENT_QUESTIONS = TARGET_ASSESSMENT_QUESTIONS;

export const assessmentQuestionSchema = z
  .object({
    id: z.string().min(1).max(120),
    topicId: z.string().min(1),
    conceptTag: z.string().min(1).max(64),
    prompt: z.string().min(1).max(300),
    options: z.tuple([
      z.string().min(1).max(200),
      z.string().min(1).max(200),
      z.string().min(1).max(200),
      z.string().min(1).max(200),
    ]),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().min(1).max(400),
    /** Optional Knowledge Graph metadata (Phase 3, backward-compatible). */
    conceptId: z.string().min(1).max(120).optional(),
    difficulty: difficultyLevelSchema.optional(),
    questionType: assessmentSkillTypeSchema.optional(),
    sourceTopicId: z.string().min(1).max(120).optional(),
    prerequisiteIds: z.array(z.string().min(1).max(120)).max(12).optional(),
  })
  .superRefine((question, ctx) => {
    const uniqueOptions = new Set(question.options.map((option) => option.trim().toLowerCase()));

    if (uniqueOptions.size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assessment options must be distinct.",
        path: ["options"],
      });
    }
  });

export const assessmentSourceSchema = z.enum(["lesson", "fallback", "hybrid", "seed"]);

export const topicAssessmentSchema = z.object({
  topicId: z.string().min(1),
  passingScore: z.number().int().min(0).max(100),
  questions: z
    .array(assessmentQuestionSchema)
    .length(TARGET_ASSESSMENT_QUESTIONS),
  source: assessmentSourceSchema,
  knowledgeGraphId: z.string().min(1).max(120).optional(),
  canonicalTopicId: z.string().min(1).max(120).optional(),
  kgValidationVersion: z.string().min(1).max(64).optional(),
});

export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;
export type AssessmentSource = z.infer<typeof assessmentSourceSchema>;
export type TopicAssessment = z.infer<typeof topicAssessmentSchema>;

export interface AssessmentValidationContext {
  goalSlug: string;
  goalCategory: GoalCategory;
}

export function validateAssessmentForGoal(
  assessment: TopicAssessment,
  context: AssessmentValidationContext,
): string | null {
  const topicMismatch = assessment.questions.some(
    (question) => question.topicId !== assessment.topicId,
  );

  if (topicMismatch) {
    return "Assessment questions must match the requested topic.";
  }

  const ids = new Set<string>();

  for (const question of assessment.questions) {
    if (ids.has(question.id)) {
      return "Assessment question IDs must be unique.";
    }

    ids.add(question.id);
  }

  const contentError = validateContentForGoalCategory(
    JSON.stringify(assessment),
    context.goalCategory,
    context.goalSlug,
  );

  if (contentError) {
    return contentError;
  }

  return validateAssessmentQuestionQuality(assessment.questions);
}

import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import { getAwsSeedLessonContent, type LessonContent } from "@/data/lesson-content";
import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import {
  buildDeterministicMentorLesson,
  type MentorFallbackContext,
  type SkillLevel,
} from "@/lib/ai/lesson-mentor-fallback";
import { formatTopicTitle } from "@/lib/format/topic-title";

export { formatTopicTitle } from "@/lib/format/topic-title";
export type { SkillLevel } from "@/lib/ai/lesson-mentor-fallback";

export interface LessonFallbackContext {
  goalId: string;
  goalSlug: string;
  goalTitle: string;
  goalCategory: GoalCategory;
  topicId: string;
  topicTitle: string;
  skillLevel: SkillLevel;
  learningObjectives?: string[];
  durationMinutes?: number;
}

function toMentorContext(context: LessonFallbackContext): MentorFallbackContext {
  return {
    goalTitle: context.goalTitle,
    goalCategory: context.goalCategory,
    topicId: context.topicId,
    topicTitle: context.topicTitle || formatTopicTitle(context.topicId),
    skillLevel: context.skillLevel,
    learningObjectives: context.learningObjectives,
    durationMinutes: context.durationMinutes,
  };
}

function legacyLessonToGenerated(
  legacy: LessonContent,
  context: LessonFallbackContext,
): GeneratedLesson {
  const mentorContext: MentorFallbackContext = {
    ...toMentorContext(context),
    topicTitle: legacy.title,
    teachingSnippets: legacy.concepts.map((concept) => ({
      title: concept.title,
      body: concept.body,
    })),
    takeawaySeed: legacy.takeaway,
    scenarioSeed: legacy.diagramCaption,
    durationMinutes: context.durationMinutes ?? legacy.estimatedMinutes,
    learningObjectives: context.learningObjectives?.length
      ? context.learningObjectives
      : [legacy.subtitle],
  };

  return buildDeterministicMentorLesson(mentorContext, legacy.topicId);
}

export function resolveDeterministicLesson(context: LessonFallbackContext): GeneratedLesson {
  if (isAwsCertificationGoal(context.goalSlug)) {
    const legacy = getAwsSeedLessonContent(context.topicId);
    return legacyLessonToGenerated(legacy, context);
  }

  return buildDeterministicMentorLesson(toMentorContext(context), context.topicId);
}

export interface DeterministicLessonInput {
  goalId: string;
  goalSlug: string;
  goalTitle: string;
  goalCategory: GoalCategory;
  topicId: string;
  topicTitle: string;
  skillLevel: SkillLevel;
  learningObjectives?: string[];
  durationMinutes?: number;
}

export function createDeterministicLessonForLearner(
  input: DeterministicLessonInput,
  reason = "deterministic-request",
): { lesson: GeneratedLesson; source: "deterministic"; fallbackReason: string } {
  const lesson = resolveDeterministicLesson({
    goalId: input.goalId,
    goalSlug: input.goalSlug,
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    skillLevel: input.skillLevel,
    learningObjectives: input.learningObjectives,
    durationMinutes: input.durationMinutes,
  });

  return {
    lesson,
    source: "deterministic",
    fallbackReason: reason,
  };
}

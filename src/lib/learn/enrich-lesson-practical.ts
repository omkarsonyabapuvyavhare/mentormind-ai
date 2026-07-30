import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import { buildFallbackPracticalBlocks } from "@/lib/ai/lesson-practical-fallback";
import type { LessonFallbackContext } from "@/lib/ai/lesson-fallback";

export function lessonHasPracticalBlocks(
  lesson: Pick<GeneratedLessonPayload, "practicalArtifact" | "handsOnExercise">,
): boolean {
  return Boolean(
    lesson.practicalArtifact?.content?.trim() &&
      lesson.handsOnExercise?.instructions?.length &&
      lesson.handsOnExercise.expectedOutcome?.trim(),
  );
}

export function enrichLessonWithPracticalBlocks(
  lesson: GeneratedLesson,
  context: LessonFallbackContext,
): GeneratedLesson {
  if (lessonHasPracticalBlocks(lesson)) {
    return lesson;
  }

  const practicalBlocks = buildFallbackPracticalBlocks({
    goalTitle: context.goalTitle,
    goalCategory: context.goalCategory,
    topicId: context.topicId,
    topicTitle: context.topicTitle,
    skillLevel: context.skillLevel,
    learningObjectives: context.learningObjectives ?? lesson.learningObjectives,
    durationMinutes: lesson.estimatedMinutes,
  });

  return {
    ...lesson,
    practicalArtifact: practicalBlocks.practicalArtifact,
    handsOnExercise: practicalBlocks.handsOnExercise,
  };
}

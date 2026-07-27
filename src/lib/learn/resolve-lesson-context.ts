import type { AppState } from "@/stores/store-types";
import { formatTopicTitle } from "@/lib/format/topic-title";
import { getTopicName } from "@/lib/engine/helpers";
import type { GenerateLessonRequest } from "@/lib/learn/generate-lesson-request-schema";

export function resolveTopicTitle(state: AppState, topicId: string): string {
  const roadmapTask = state.roadmap?.tasks.find((task) => task.topicId === topicId);
  if (roadmapTask?.title) {
    return roadmapTask.title.replace(/\s*(—|-)\s*.+$/, "").trim() || roadmapTask.title;
  }

  const knownChallenge = state.twin?.knownChallenges.find(
    (challenge) => challenge.topicId === topicId,
  );
  if (knownChallenge?.topicName) {
    return knownChallenge.topicName;
  }

  const named = getTopicName(topicId);
  if (named !== topicId) {
    return named;
  }

  return formatTopicTitle(topicId);
}

export function resolveLessonTaskContext(state: AppState, topicId: string) {
  const lessonTask = state.roadmap?.tasks.find(
    (task) => task.topicId === topicId && task.type === "lesson",
  );
  const anyTask = state.roadmap?.tasks.find((task) => task.topicId === topicId);

  return lessonTask ?? anyTask ?? null;
}

export function resolveLessonLearningObjectives(state: AppState, topicId: string): string[] | undefined {
  const lessonTask = state.roadmap?.tasks.find(
    (task) => task.topicId === topicId && task.type === "lesson",
  );

  if (lessonTask?.learningObjectives?.length) {
    return lessonTask.learningObjectives;
  }

  const quizTask = state.roadmap?.tasks.find(
    (task) => task.topicId === topicId && task.type === "quiz",
  );

  if (quizTask?.learningObjectives?.length) {
    return quizTask.learningObjectives;
  }

  return undefined;
}

export function buildGenerateLessonRequest(
  state: AppState,
  topicId: string,
): GenerateLessonRequest | null {
  if (!state.twin || !state.roadmap) {
    return null;
  }

  const task = resolveLessonTaskContext(state, topicId);

  return {
    goalId: state.roadmap.goalId,
    goalSlug: state.roadmap.goalId,
    goalTitle: state.twin.goal.title,
    goalCategory: state.twin.goal.category as GenerateLessonRequest["goalCategory"],
    goalType: state.twin.goal.type,
    topicId,
    topicTitle: resolveTopicTitle(state, topicId),
    skillLevel: state.twin.skillLevel,
    durationMinutes: task?.estimatedMinutes ?? 45,
    learningObjectives: resolveLessonLearningObjectives(state, topicId),
    preferredFormats: [...state.twin.preferences.preferredFormats],
  };
}

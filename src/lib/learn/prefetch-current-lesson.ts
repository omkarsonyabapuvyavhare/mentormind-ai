import { fetchGeneratedLesson } from "@/lib/learn/fetch-generated-lesson";
import { recordLessonFetchTiming } from "@/lib/learn/lesson-fetch-timing";
import { readCachedLesson } from "@/lib/learn/lesson-session-cache";
import {
  buildGenerateLessonRequest,
  resolveTopicTitle,
} from "@/lib/learn/resolve-lesson-context";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import { selectNextTask, selectUpcomingTasks } from "@/stores/selectors";
import type { AppState } from "@/stores/store-types";

export function resolveCurrentLessonTopicId(state: AppState): string | null {
  return selectNextTask(state)?.topicId ?? null;
}

export async function prefetchLessonForTopic(
  state: AppState,
  topicId: string,
  options: { prefetchNext?: boolean } = {},
): Promise<GeneratedLessonPayload | null> {
  const request = buildGenerateLessonRequest(state, topicId);

  if (!request) {
    return null;
  }

  const cached = readCachedLesson(request.goalId, topicId);

  if (cached) {
    recordLessonFetchTiming("cache-hit", {
      topicId,
      goalId: request.goalId,
      detail: "prefetch skipped — already cached",
    });
    return cached;
  }

  recordLessonFetchTiming("prefetch-start", { topicId, goalId: request.goalId });

  const lesson = await fetchGeneratedLesson(request);

  recordLessonFetchTiming("prefetch-complete", {
    topicId,
    goalId: request.goalId,
    detail: lesson.source,
  });

  if (options.prefetchNext !== false) {
    prefetchNextUnlockedLesson(state, topicId);
  }

  return lesson;
}

export function prefetchCurrentLesson(state: AppState): void {
  const topicId = resolveCurrentLessonTopicId(state);

  if (!topicId || !state.roadmap) {
    return;
  }

  if (readCachedLesson(state.roadmap.goalId, topicId)) {
    recordLessonFetchTiming("cache-hit", {
      topicId,
      goalId: state.roadmap.goalId,
      detail: "current lesson already cached",
    });
    prefetchNextUnlockedLesson(state, topicId);
    return;
  }

  void prefetchLessonForTopic(state, topicId);
}

function prefetchNextUnlockedLesson(state: AppState, currentTopicId: string): void {
  if (!state.roadmap) {
    return;
  }

  const upcoming = selectUpcomingTasks(state);
  const currentIndex = upcoming.findIndex((task) => task.topicId === currentTopicId);
  const nextTask = currentIndex >= 0 ? upcoming[currentIndex + 1] : upcoming[1];

  if (!nextTask || nextTask.topicId === currentTopicId) {
    return;
  }

  if (readCachedLesson(state.roadmap.goalId, nextTask.topicId)) {
    return;
  }

  recordLessonFetchTiming("prefetch-next-start", {
    topicId: nextTask.topicId,
    goalId: state.roadmap.goalId,
    detail: resolveTopicTitle(state, nextTask.topicId),
  });

  void prefetchLessonForTopic(state, nextTask.topicId, { prefetchNext: false });
}

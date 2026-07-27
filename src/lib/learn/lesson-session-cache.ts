import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";

const CACHE_PREFIX = "mentormind-lesson-cache:";

function buildCacheKey(goalId: string, topicId: string): string {
  return `${CACHE_PREFIX}${goalId}:${topicId}`;
}

export function readCachedLesson(
  goalId: string,
  topicId: string,
): GeneratedLessonPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(buildCacheKey(goalId, topicId));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GeneratedLessonPayload;
    if (parsed.topicId !== topicId) {
      return null;
    }

    return { ...parsed, source: "cache" };
  } catch {
    return null;
  }
}

export function writeCachedLesson(goalId: string, lesson: GeneratedLessonPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(buildCacheKey(goalId, lesson.topicId), JSON.stringify(lesson));
}

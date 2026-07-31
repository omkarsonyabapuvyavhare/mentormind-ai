import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import {
  originalSourceFromLessonSource,
  reportLessonSource,
  type LessonOriginalSource,
} from "@/lib/dev/lesson-source-observability";

const CACHE_PREFIX = "mentormind-lesson-cache:v3:";
const LEGACY_PREFIXES = ["mentormind-lesson-cache:v2:", "mentormind-lesson-cache:"] as const;
const ORIGIN_PREFIX = "mentormind-lesson-origin:v1:";

const GENERIC_TOPIC_IDS = new Set([
  "foundations",
  "core-concepts",
  "basics",
  "introduction",
  "review",
  "applied-practice",
  "overview",
  "fundamentals",
  "practice",
]);

function buildCacheKey(goalId: string, topicId: string): string {
  return `${CACHE_PREFIX}${goalId}:${topicId}`;
}

function buildOriginKey(goalId: string, topicId: string): string {
  return `${ORIGIN_PREFIX}${goalId}:${topicId}`;
}

function clearLegacyLessonEntries(goalId: string, topicId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_PREFIXES) {
    window.sessionStorage.removeItem(`${prefix}${goalId}:${topicId}`);
  }
}

function writeLessonOrigin(
  goalId: string,
  topicId: string,
  originalSource: LessonOriginalSource,
): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  window.sessionStorage.setItem(buildOriginKey(goalId, topicId), originalSource);
}

function readLessonOrigin(goalId: string, topicId: string): LessonOriginalSource | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const stored = window.sessionStorage.getItem(buildOriginKey(goalId, topicId));
  if (stored === "ai" || stored === "deterministic" || stored === "emergency") {
    return stored;
  }

  return undefined;
}

/** Dev-only: inspect stored provenance without changing the returned lesson source. */
export function peekCachedLessonOriginalSource(
  goalId: string,
  topicId: string,
): LessonOriginalSource | undefined {
  return readLessonOrigin(goalId, topicId);
}

function isIncompatibleCachedLesson(lesson: GeneratedLessonPayload, topicId: string): boolean {
  if (lesson.topicId !== topicId) {
    return true;
  }

  if (GENERIC_TOPIC_IDS.has(lesson.topicId)) {
    return true;
  }

  const haystack = `${lesson.title} ${lesson.learningObjectives.join(" ")}`;
  if (/explain key ideas in/i.test(haystack)) {
    return true;
  }

  if (/^(foundations|core concepts|basics|introduction)$/i.test(lesson.title.trim())) {
    return true;
  }

  return false;
}

export function readCachedLesson(
  goalId: string,
  topicId: string,
): GeneratedLessonPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  clearLegacyLessonEntries(goalId, topicId);

  const cacheKey = buildCacheKey(goalId, topicId);
  const raw = window.sessionStorage.getItem(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GeneratedLessonPayload;
    if (isIncompatibleCachedLesson(parsed, topicId)) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    const originalSource =
      readLessonOrigin(goalId, topicId) ??
      originalSourceFromLessonSource(parsed.source === "cache" ? "deterministic" : parsed.source);

    if (process.env.NODE_ENV === "development") {
      reportLessonSource({
        goalTitle: parsed.title,
        topicTitle: parsed.title,
        goalId,
        topicId,
        displaySource: "Lesson Cache",
        originalSource,
        cache: "HIT",
      });
    }

    return { ...parsed, source: "cache" };
  } catch {
    window.sessionStorage.removeItem(cacheKey);
    return null;
  }
}

export function writeCachedLesson(
  goalId: string,
  lesson: GeneratedLessonPayload,
  originalSource?: LessonOriginalSource,
): void {
  if (typeof window === "undefined") {
    return;
  }

  clearLegacyLessonEntries(goalId, lesson.topicId);

  if (isIncompatibleCachedLesson(lesson, lesson.topicId)) {
    return;
  }

  const resolvedOrigin =
    originalSource ??
    originalSourceFromLessonSource(lesson.source === "cache" ? "deterministic" : lesson.source);

  if (resolvedOrigin) {
    writeLessonOrigin(goalId, lesson.topicId, resolvedOrigin);
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[LessonCache] WRITE", {
      goalId,
      topicId: lesson.topicId,
      storedSource: lesson.source,
      originalSource: resolvedOrigin,
      cachePrefix: CACHE_PREFIX,
    });
  }

  window.sessionStorage.setItem(buildCacheKey(goalId, lesson.topicId), JSON.stringify(lesson));
}

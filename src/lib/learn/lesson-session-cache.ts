import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import {
  originalSourceFromLessonSource,
  reportLessonSource,
  type LessonOriginalSource,
} from "@/lib/dev/lesson-source-observability";
import type { GoalCategory } from "@/lib/goals/goal-identity";

/** Bump when lesson shape / KG metadata changes invalidate stored sessions. */
export const LESSON_CACHE_VERSION = "v5";
const CACHE_PREFIX = `mentormind-lesson-cache:${LESSON_CACHE_VERSION}:`;
/** Versioned prefixes only — never the bare `mentormind-lesson-cache:` stem (it matches v5). */
const LEGACY_VERSIONED_PREFIXES = [
  "mentormind-lesson-cache:v4:",
  "mentormind-lesson-cache:v3:",
  "mentormind-lesson-cache:v2:",
] as const;
const UNVERSIONED_LESSON_PREFIX = "mentormind-lesson-cache:";
const ORIGIN_PREFIX = "mentormind-lesson-origin:v1:";
const ORIGIN_LEGACY_CLEAR_MARKER = "mentormind-lesson-origin-cleared:v5";

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

function clearSessionStorageByPrefix(prefix: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    window.sessionStorage.removeItem(key);
  }
}

/** Unversioned keys look like `mentormind-lesson-cache:goal:topic` (no `:vN:`). */
function isUnversionedLessonCacheKey(key: string): boolean {
  if (!key.startsWith(UNVERSIONED_LESSON_PREFIX)) {
    return false;
  }

  const rest = key.slice(UNVERSIONED_LESSON_PREFIX.length);
  return !/^v\d+:/.test(rest);
}

function clearUnversionedLessonCaches(): void {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key && isUnversionedLessonCacheKey(key)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    window.sessionStorage.removeItem(key);
  }
}

/** Drop pre-v4 lesson cache + origin sidecars once per browser session. */
export function clearLegacyLessonCaches(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_VERSIONED_PREFIXES) {
    clearSessionStorageByPrefix(prefix);
  }
  clearUnversionedLessonCaches();

  if (window.sessionStorage.getItem(ORIGIN_LEGACY_CLEAR_MARKER) === "1") {
    return;
  }

  clearSessionStorageByPrefix(ORIGIN_PREFIX);
  window.sessionStorage.setItem(ORIGIN_LEGACY_CLEAR_MARKER, "1");
}

function clearLegacyLessonEntries(goalId: string, topicId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_VERSIONED_PREFIXES) {
    window.sessionStorage.removeItem(`${prefix}${goalId}:${topicId}`);
  }
  window.sessionStorage.removeItem(`${UNVERSIONED_LESSON_PREFIX}${goalId}:${topicId}`);
}

function writeLessonOrigin(
  goalId: string,
  topicId: string,
  originalSource: LessonOriginalSource,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(buildOriginKey(goalId, topicId), originalSource);
}

function readLessonOrigin(goalId: string, topicId: string): LessonOriginalSource | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const stored = window.sessionStorage.getItem(buildOriginKey(goalId, topicId));
  if (
    stored === "ai" ||
    stored === "gemini" ||
    stored === "grok" ||
    stored === "kg" ||
    stored === "deterministic" ||
    stored === "emergency"
  ) {
    return stored;
  }

  return undefined;
}

/** Inspect stored provenance without changing the returned lesson source. */
export function peekCachedLessonOriginalSource(
  goalId: string,
  topicId: string,
): LessonOriginalSource | undefined {
  return readLessonOrigin(goalId, topicId);
}

function sectionCorpus(lesson: GeneratedLessonPayload): string {
  return JSON.stringify(lesson.sections ?? []).toLowerCase();
}

function artifactCorpus(lesson: GeneratedLessonPayload): string {
  return JSON.stringify({
    practicalArtifact: lesson.practicalArtifact,
    handsOnExercise: lesson.handsOnExercise,
  }).toLowerCase();
}

function isObjectiveDrivenCachedLesson(lesson: GeneratedLessonPayload): boolean {
  const body = sectionCorpus(lesson);
  const artifacts = artifactCorpus(lesson);

  if (/\bapply\b.+\bin a concrete worked example\b/.test(body)) {
    return true;
  }

  if (/\bconcrete worked example\b/.test(artifacts)) {
    return true;
  }

  // Pre-topic-first mentor templates: vague procedure without domain substance.
  const vagueProcedure =
    /\bdefine inputs and success criteria\b/.test(body) &&
    /\bexecute the core steps\b/.test(body);
  if (vagueProcedure && !/\betl\b|\belt\b|\bpipeline\b/.test(body)) {
    return true;
  }

  return false;
}

function lacksDataEngineeringFundamentalsConcepts(lesson: GeneratedLessonPayload): boolean {
  const title = lesson.title.toLowerCase();
  const topicId = lesson.topicId.toLowerCase();
  const identity = `${title} ${topicId}`;

  const isDataEngineeringFundamentals =
    /\bdata engineering\b/.test(identity) || /\bdata-engineering\b/.test(identity);

  if (!isDataEngineeringFundamentals) {
    return false;
  }

  const isFundamentalsScoped =
    /fundamental|landscape|overview|intro|basics/.test(identity) ||
    /data-engineering-fundamentals|data-engineering-landscape/.test(topicId) ||
    title.trim() === "data engineering";

  if (!isFundamentalsScoped) {
    return false;
  }

  const body = `${sectionCorpus(lesson)} ${artifactCorpus(lesson)}`;
  const conceptChecks = [
    /\betl\b/,
    /\belt\b/,
    /\bpipeline/,
    /\b(data lakes?|lakehouse)\b/,
    /\bwarehouse/,
    /\b(batch|streaming)\b/,
    /\b(airflow|orchestrat)/,
    /\b(data quality|quality check|spark)\b/,
  ];

  const hits = conceptChecks.filter((pattern) => pattern.test(body)).length;
  return hits < 4;
}

export function isIncompatibleCachedLesson(
  lesson: GeneratedLessonPayload,
  topicId: string,
  options?: {
    goalTitle?: string;
    goalCategory?: GoalCategory;
    goalId?: string;
  },
): boolean {
  if (lesson.topicId !== topicId) {
    return true;
  }

  if (GENERIC_TOPIC_IDS.has(lesson.topicId)) {
    return true;
  }

  const haystack = `${lesson.title} ${lesson.learningObjectives.join(" ")}`;
  if (/explain key ideas in|which statement best reflects/i.test(haystack)) {
    return true;
  }

  if (/^(foundations|core concepts|basics|introduction)$/i.test(lesson.title.trim())) {
    return true;
  }

  if (isObjectiveDrivenCachedLesson(lesson)) {
    return true;
  }

  if (lacksDataEngineeringFundamentalsConcepts(lesson)) {
    return true;
  }

  if (
    options?.goalTitle &&
    options.goalCategory &&
    resolveKnowledgeGraph(options.goalTitle, options.goalCategory, [
      options.goalId ?? "",
    ]).status === "resolved"
  ) {
    if (!lesson.knowledgeGraphId || !lesson.canonicalTopicId) {
      return true;
    }
    if (
      lesson.kgValidationVersion &&
      lesson.kgValidationVersion !== KG_VALIDATION_VERSION
    ) {
      return true;
    }
    if (lesson.canonicalTopicId !== topicId && lesson.topicId !== topicId) {
      return true;
    }
  }

  return false;
}

export function readCachedLesson(
  goalId: string,
  topicId: string,
  options?: {
    goalTitle?: string;
    goalCategory?: GoalCategory;
  },
): GeneratedLessonPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  clearLegacyLessonCaches();
  clearLegacyLessonEntries(goalId, topicId);

  const cacheKey = buildCacheKey(goalId, topicId);
  const raw = window.sessionStorage.getItem(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GeneratedLessonPayload;
    if (
      isIncompatibleCachedLesson(parsed, topicId, {
        goalTitle: options?.goalTitle,
        goalCategory: options?.goalCategory,
        goalId,
      })
    ) {
      window.sessionStorage.removeItem(cacheKey);
      window.sessionStorage.removeItem(buildOriginKey(goalId, topicId));
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

  clearLegacyLessonCaches();
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

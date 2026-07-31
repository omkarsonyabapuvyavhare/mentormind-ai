import {
  topicAssessmentSchema,
  type TopicAssessment,
} from "@/lib/assessment/assessment-schema";

export const ASSESSMENT_CACHE_VERSION = "v4";
const CACHE_PREFIX = `mentormind-assessment-cache:${ASSESSMENT_CACHE_VERSION}:`;
/** Versioned prefixes only — bare stem matches current v4 keys. */
const LEGACY_VERSIONED_PREFIXES = [
  "mentormind-assessment-cache:v3:",
  "mentormind-assessment-cache:v2:",
] as const;
const UNVERSIONED_ASSESSMENT_PREFIX = "mentormind-assessment-cache:";

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

function isUnversionedAssessmentCacheKey(key: string): boolean {
  if (!key.startsWith(UNVERSIONED_ASSESSMENT_PREFIX)) {
    return false;
  }

  const rest = key.slice(UNVERSIONED_ASSESSMENT_PREFIX.length);
  return !/^v\d+:/.test(rest);
}

/** Drop pre-v4 assessment cache entries (all goals/topics). */
export function clearLegacyAssessmentCaches(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_VERSIONED_PREFIXES) {
    clearSessionStorageByPrefix(prefix);
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key && isUnversionedAssessmentCacheKey(key)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    window.sessionStorage.removeItem(key);
  }
}

function clearIncompatibleCacheEntries(goalId: string, topicId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_VERSIONED_PREFIXES) {
    window.sessionStorage.removeItem(`${prefix}${goalId}:${topicId}`);
  }
  window.sessionStorage.removeItem(`${UNVERSIONED_ASSESSMENT_PREFIX}${goalId}:${topicId}`);
}

function isIncompatibleCachedAssessment(assessment: TopicAssessment, topicId: string): boolean {
  if (assessment.topicId !== topicId || GENERIC_TOPIC_IDS.has(assessment.topicId)) {
    return true;
  }

  const haystack = assessment.questions.map((question) => question.prompt).join(" ");
  return /explain key ideas in|which statement best reflects/i.test(haystack);
}

export function readCachedAssessment(
  goalId: string,
  topicId: string,
): TopicAssessment | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Drop pre-v4 / generic quiz entries so stale Foundations quizzes are never reused.
  clearLegacyAssessmentCaches();
  clearIncompatibleCacheEntries(goalId, topicId);

  const cacheKey = buildCacheKey(goalId, topicId);
  const raw = window.sessionStorage.getItem(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const validated = topicAssessmentSchema.safeParse(parsed);

    if (
      !validated.success ||
      validated.data.topicId !== topicId ||
      isIncompatibleCachedAssessment(validated.data, topicId)
    ) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    return validated.data;
  } catch {
    window.sessionStorage.removeItem(cacheKey);
    return null;
  }
}

export function writeCachedAssessment(
  goalId: string,
  assessment: TopicAssessment,
): void {
  if (typeof window === "undefined") {
    return;
  }

  clearIncompatibleCacheEntries(goalId, assessment.topicId);

  if (isIncompatibleCachedAssessment(assessment, assessment.topicId)) {
    return;
  }

  window.sessionStorage.setItem(
    buildCacheKey(goalId, assessment.topicId),
    JSON.stringify(assessment),
  );
}

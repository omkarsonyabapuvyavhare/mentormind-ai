import {
  topicAssessmentSchema,
  type TopicAssessment,
} from "@/lib/assessment/assessment-schema";

const CACHE_PREFIX = "mentormind-assessment-cache:v3:";
const LEGACY_CACHE_PREFIXES = [
  "mentormind-assessment-cache:v2:",
  "mentormind-assessment-cache:",
] as const;

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

function clearIncompatibleCacheEntries(goalId: string, topicId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const prefix of LEGACY_CACHE_PREFIXES) {
    window.sessionStorage.removeItem(`${prefix}${goalId}:${topicId}`);
  }
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

  // Drop pre-v3 / generic quiz entries so stale Foundations quizzes are never reused.
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

import {
  topicAssessmentSchema,
  type TopicAssessment,
} from "@/lib/assessment/assessment-schema";

const CACHE_PREFIX = "mentormind-assessment-cache:";

function buildCacheKey(goalId: string, topicId: string): string {
  return `${CACHE_PREFIX}${goalId}:${topicId}`;
}

export function readCachedAssessment(
  goalId: string,
  topicId: string,
): TopicAssessment | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(buildCacheKey(goalId, topicId));

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const validated = topicAssessmentSchema.safeParse(parsed);

    if (!validated.success || validated.data.topicId !== topicId) {
      window.sessionStorage.removeItem(buildCacheKey(goalId, topicId));
      return null;
    }

    return validated.data;
  } catch {
    window.sessionStorage.removeItem(buildCacheKey(goalId, topicId));
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

  window.sessionStorage.setItem(
    buildCacheKey(goalId, assessment.topicId),
    JSON.stringify(assessment),
  );
}

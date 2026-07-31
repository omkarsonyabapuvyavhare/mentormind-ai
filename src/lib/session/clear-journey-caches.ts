import { clearLegacyAssessmentCaches } from "@/lib/assessment/assessment-session-cache";
import { clearLegacyLessonCaches } from "@/lib/learn/lesson-session-cache";
import { clearPendingOnboarding } from "@/lib/onboarding/fetch-generated-roadmap";

const LESSON_PREFIX = "mentormind-lesson-cache:";
const ASSESSMENT_PREFIX = "mentormind-assessment-cache:";
const LESSON_ORIGIN_PREFIX = "mentormind-lesson-origin:";

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

/** Clears only lesson + assessment session caches (and lesson origin sidecars). */
export function clearLessonAndAssessmentCaches(): void {
  clearLegacyLessonCaches();
  clearLegacyAssessmentCaches();
  clearSessionStorageByPrefix(LESSON_PREFIX);
  clearSessionStorageByPrefix(ASSESSMENT_PREFIX);
  clearSessionStorageByPrefix(LESSON_ORIGIN_PREFIX);
}

/** Clears onboarding, lesson, and assessment session caches. */
export function clearAllJourneyCaches(): void {
  clearPendingOnboarding();
  clearLessonAndAssessmentCaches();
}

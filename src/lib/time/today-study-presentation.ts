import { thresholds } from "@/constants/thresholds";
import type { AppState } from "@/stores/store-types";
import type { ReasonCode } from "@/types/decisions";

/** Hackathon-friendly "today" study totals — presentation only, not engine state. */
export const todayStudyPresentation = {
  demoBaselineMinutes: 24,
  afterWeakQuizMinutes: 42,
  afterInactivityMinutes: 42,
  afterMasteryMinutes: 68,
} as const;

function hasDecisionReason(state: Pick<AppState, "decisions">, reason: ReasonCode): boolean {
  return state.decisions.some((decision) => decision.reasons.includes(reason));
}

function latestQuizScore(state: Pick<AppState, "twin">): number | null {
  const history = state.twin?.quizHistory ?? [];

  if (history.length === 0) {
    return null;
  }

  return history[history.length - 1]!.score;
}

/**
 * Believable accumulated study time for today — derived from learner/demo signals,
 * never from browser uptime or lifetime twin totals.
 */
export function selectTodayStudyPresentationMinutes(
  state: Pick<AppState, "presenterMode" | "twin" | "decisions">,
): number {
  const twin = state.twin;

  if (!twin) {
    return 0;
  }

  const latestScore = latestQuizScore(state);

  if (state.presenterMode) {
    if (
      hasDecisionReason(state, "QUIZ_MASTERY_ACHIEVED") ||
      (latestScore !== null && latestScore >= thresholds.masteryScore)
    ) {
      return todayStudyPresentation.afterMasteryMinutes;
    }

    if (hasDecisionReason(state, "INACTIVITY_ESCALATION")) {
      return todayStudyPresentation.afterInactivityMinutes;
    }

    if (
      hasDecisionReason(state, "QUIZ_BELOW_THRESHOLD") ||
      (latestScore !== null && latestScore < thresholds.weakQuizScore)
    ) {
      return todayStudyPresentation.afterWeakQuizMinutes;
    }

    return todayStudyPresentation.demoBaselineMinutes;
  }

  if (latestScore === null) {
    return 0;
  }

  const focusBlock = twin.preferences.focusDurationMinutes;

  if (latestScore >= thresholds.masteryScore) {
    return focusBlock + Math.round(focusBlock * 0.51);
  }

  if (latestScore < thresholds.weakQuizScore) {
    return Math.round(focusBlock * 0.93);
  }

  return focusBlock;
}

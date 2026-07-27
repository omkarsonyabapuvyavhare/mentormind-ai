"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/constants/routes";
import { thresholds } from "@/constants/thresholds";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { buildInactivityEvent } from "@/lib/demo/session-actions";
import { resolvePresenterAssessment } from "@/lib/presenter/resolve-presenter-assessment";
import {
  buildPresenterQuizCompletedEvent,
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import { selectTodayMission } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";
import type { AdaptationRevealKind } from "@/types/ui-state";

function resolveRevealKind(score: number): AdaptationRevealKind {
  if (score >= thresholds.masteryScore) {
    return "mastery";
  }

  if (score < thresholds.weakQuizScore) {
    return "weakness";
  }

  return "neutral";
}

export function usePresenterControlActions(assessmentOverride?: TopicAssessment) {
  const router = useRouter();
  const state = useAppStore();
  const dispatchLearnerEvent = useAppStore((store) => store.dispatchLearnerEvent);
  const showAdaptationReveal = useAppStore((store) => store.showAdaptationReveal);
  const resetJourney = useAppStore((store) => store.resetJourney);
  const mission = selectTodayMission(state);

  const simulate = useCallback(
    (score: number) => {
      const currentState = useAppStore.getState();
      const assessment = assessmentOverride ?? resolvePresenterAssessment(currentState);

      if (!assessment) {
        window.alert("No assessment context for the current topic. Open the lesson or assessment first.");
        return;
      }

      const event = buildPresenterQuizCompletedEvent(assessment, score, new Date().toISOString());
      dispatchLearnerEvent(event);
      showAdaptationReveal(resolveRevealKind(score), score);
      router.push(routes.mentorFeedback);
    },
    [assessmentOverride, dispatchLearnerEvent, router, showAdaptationReveal],
  );

  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      "Reset the learner journey? This clears onboarding progress, caches, and adaptations.",
    );

    if (!confirmed) {
      return;
    }

    resetJourney();
    router.push(routes.onboarding);
  }, [resetJourney, router]);

  const handleFastForward = useCallback(() => {
    dispatchLearnerEvent(buildInactivityEvent(new Date().toISOString()));
    router.push(routes.dashboard);
  }, [dispatchLearnerEvent, router]);

  return {
    simulate,
    handleReset,
    handleFastForward,
    mission,
    weakScore: PRESENTER_WEAK_SCORE,
    masteryScore: PRESENTER_MASTERY_SCORE,
  };
}

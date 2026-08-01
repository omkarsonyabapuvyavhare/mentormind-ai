import { demo } from "@/constants/demo";
import { routes } from "@/constants/routes";
import {
  findLastWeakQuizDecisionIndex,
  hasInactivityAfterDecisionIndex,
} from "@/lib/demo/engagement-timeline-reset";
import { isPresenterModeEnabledByEnv } from "@/lib/presenter/presenter-mode";
import { selectTodayMission } from "@/lib/tutor/mission";
import type { AppState } from "@/stores/store-types";
import {
  selectLatestDecision,
  selectNextTask,
  selectWeakTopics,
} from "@/stores/selectors";

export interface SessionAction {
  label: string;
  href: string;
  hint?: string;
}

export type LiveLoopStepId =
  | "plan"
  | "session"
  | "assess"
  | "adapt"
  | "explain"
  | "master";

export interface LiveLoopStep {
  id: LiveLoopStepId;
  label: string;
  complete: boolean;
  current: boolean;
}

/** Primary CTA that advances the live demo loop with minimal clicks. */
export function selectSessionPrimaryAction(state: AppState): SessionAction {
  const flowHint = state.flowCheckpoint;
  const latestDecision = selectLatestDecision(state);
  const weaknesses = selectWeakTopics(state);
  const quizCount = state.twin?.quizHistory.length ?? 0;
  const nextTask = selectNextTask(state);

  if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return {
      label: "See your accelerated plan",
      href: routes.roadmap,
      hint: "MentorMind removed remedial work and unlocked advanced content.",
    };
  }

  if (
    flowHint === "explain-seen" &&
    weaknesses.length > 0 &&
    quizCount > 0 &&
    !latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")
  ) {
    return {
      label: "Retake topic check-in",
      href: selectTodayMission(state).assessmentHref ?? routes.dashboard,
      hint: "Demonstrate mastery to accelerate your learning timeline.",
    };
  }

  if (flowHint === "twin-seen" && latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return {
      label: "Ask your AI Mentor why",
      href: routes.mentor,
      hint: "See the explainable decision behind your roadmap change.",
    };
  }

  if (flowHint === "adapt-seen" && latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return {
      label: "See your updated Learning Twin",
      href: routes.profile,
      hint: "Your learner memory now reflects the quiz signal and weakness.",
    };
  }

  if (
    quizCount > 0 &&
    latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD") &&
    !flowHint
  ) {
    return {
      label: "See how your plan changed",
      href: routes.roadmap,
      hint: "Your roadmap gained remediation tasks after the quiz signal.",
    };
  }

  return {
    label: "Start learning",
    href: selectTodayMission(state).lessonHref,
    hint: nextTask
      ? `${nextTask.title} · ${nextTask.estimatedMinutes} min`
      : "Your mentor picked today's lesson — begin when you're ready",
  };
}

export function selectSecondarySessionActions(state: AppState): SessionAction[] {
  const primary = selectSessionPrimaryAction(state);
  const actions: SessionAction[] = [
    { label: "Dashboard", href: routes.dashboard },
    { label: "Roadmap", href: routes.roadmap },
    { label: "AI Mentor", href: routes.mentor },
    { label: "Learning Twin", href: routes.profile },
  ];

  return actions
    .filter((action) => action.href !== primary.href)
    .slice(0, 3);
}

export { findLastWeakQuizDecisionIndex, hasInactivityAfterDecisionIndex } from "@/lib/demo/engagement-timeline-reset";

export function shouldShowInactivityShortcut(state: AppState): boolean {
  // Prefer store flag; also honor build-time NEXT_PUBLIC_PRESENTER_MODE for Vercel bundles.
  if (!state.presenterMode && !isPresenterModeEnabledByEnv()) {
    return false;
  }

  const lastWeakQuizIndex = findLastWeakQuizDecisionIndex(state);
  if (lastWeakQuizIndex >= 0) {
    return !hasInactivityAfterDecisionIndex(state, lastWeakQuizIndex);
  }

  // Presenter mode: keep the Fast Forward Timeline card beside Learner Engagement
  // even before a weak quiz. Hide once inactivity has already been applied.
  return !state.decisions.some((decision) =>
    decision.reasons.includes("INACTIVITY_ESCALATION"),
  );
}

export function buildInactivityEvent(timestamp: string) {
  return {
    type: "INACTIVITY_TICK" as const,
    days: demo.inactivityDays,
    timestamp,
  };
}

export function selectLiveLoopSteps(state: AppState): LiveLoopStep[] {
  const hasPlan = state.isInitialized && Boolean(state.twin && state.roadmap);
  const quizCount = state.twin?.quizHistory.length ?? 0;
  const latestDecision = selectLatestDecision(state);
  const hasWeakQuiz = state.decisions.some((decision) =>
    decision.reasons.includes("QUIZ_BELOW_THRESHOLD"),
  );
  const hasMastery = latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED") ?? false;
  const hasAdaptation =
    hasWeakQuiz ||
    hasMastery ||
    state.decisions.some((decision) => decision.reasons.includes("INACTIVITY_ESCALATION"));

  const steps: Omit<LiveLoopStep, "current">[] = [
    { id: "plan", label: "Plan", complete: hasPlan },
    { id: "session", label: "Session", complete: quizCount > 0 || hasWeakQuiz },
    { id: "assess", label: "Assess", complete: quizCount > 0 },
    { id: "adapt", label: "Adapt", complete: hasAdaptation },
    {
      id: "explain",
      label: "Explain",
      complete: state.flowCheckpoint === "explain-seen" || hasMastery,
    },
    { id: "master", label: "Master", complete: hasMastery },
  ];

  const firstIncomplete = steps.findIndex((step) => !step.complete);

  return steps.map((step, index) => ({
    ...step,
    current: firstIncomplete === -1 ? index === steps.length - 1 : index === firstIncomplete,
  }));
}

export function selectQuizResultPrimaryAction(state: AppState): SessionAction {
  const latestDecision = selectLatestDecision(state);

  if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return {
      label: "See updated learning plan",
      href: routes.planUpdated,
    };
  }

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return {
      label: "See updated learning plan",
      href: routes.planUpdated,
    };
  }

  return {
    label: "Continue learning",
    href: routes.dashboard,
  };
}

export function selectQuizResultSecondaryActions(state: AppState): SessionAction[] {
  const latestDecision = selectLatestDecision(state);

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return [
      { label: "Review Learning Twin", href: routes.profile },
      { label: "Back to Dashboard", href: routes.dashboard },
    ];
  }

  if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return [
      { label: "Ask your AI Mentor why", href: routes.mentor },
      { label: "Back to Dashboard", href: routes.dashboard },
    ];
  }

  return [{ label: "Back to Dashboard", href: routes.dashboard }];
}

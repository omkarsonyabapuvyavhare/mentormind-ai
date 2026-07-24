import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { capScore } from "@/lib/engine/helpers";
import type { AppState } from "@/stores/store-types";
import type { DecisionAction } from "@/types/decisions";
import type { LearnerEvent } from "@/types/events";
import type { LearningTwin, Roadmap } from "@/types";
import type { Decision } from "@/types/decisions";
import type { Nudge } from "@/types/nudge";

export interface EngagementTimelineBaseline {
  twin: LearningTwin;
  roadmap: Roadmap;
  decisions: Decision[];
  nudges: Nudge[];
  learnerEvents: LearnerEvent[];
}

export function findLastWeakQuizDecisionIndex(state: AppState): number {
  for (let index = state.decisions.length - 1; index >= 0; index -= 1) {
    if (state.decisions[index]?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
      return index;
    }
  }

  return -1;
}

export function hasInactivityAfterDecisionIndex(
  state: AppState,
  decisionIndex: number,
): boolean {
  if (decisionIndex < 0) {
    return false;
  }

  return state.decisions
    .slice(decisionIndex + 1)
    .some((decision) => decision.reasons.includes("INACTIVITY_ESCALATION"));
}

export function isInactivityNudge(nudge: Nudge): boolean {
  return nudge.id.includes("inactivity") || /inactive/i.test(nudge.body);
}

export function shouldShowResetTimeline(state: AppState): boolean {
  if (!state.demoMode) {
    return false;
  }

  const lastWeakQuizIndex = findLastWeakQuizDecisionIndex(state);
  if (lastWeakQuizIndex < 0) {
    return false;
  }

  return hasInactivityAfterDecisionIndex(state, lastWeakQuizIndex);
}

export function buildEngagementTimelineBaselineFromState(
  state: AppState,
): EngagementTimelineBaseline | null {
  if (!state.demoMode || !state.twin || !state.roadmap) {
    return null;
  }

  return {
    twin: structuredClone(state.twin),
    roadmap: structuredClone(state.roadmap),
    decisions: structuredClone(state.decisions),
    nudges: structuredClone(state.nudges),
    learnerEvents: structuredClone(state.learnerEvents),
  };
}

function resolvePreInactivityLastActiveAt(state: AppState): string {
  const quizHistory = state.twin?.quizHistory ?? [];

  if (quizHistory.length > 0) {
    return quizHistory[quizHistory.length - 1]!.completedAt;
  }

  const lastNonInactivity = [...state.learnerEvents]
    .reverse()
    .find((event) => event.type !== "INACTIVITY_TICK");

  if (lastNonInactivity) {
    return lastNonInactivity.timestamp;
  }

  return state.twin!.lastActiveAt;
}

function resolvePreInactivityStreak(state: AppState): number {
  const twin = state.twin!;

  if (
    twin.currentStreakDays === 0 &&
    state.decisions.some((decision) =>
      decision.reasons.includes("INACTIVITY_ESCALATION"),
    )
  ) {
    return demo.initialStreakDays;
  }

  return twin.currentStreakDays;
}

function findShortenNextTaskAction(
  decision: Decision | undefined,
): Extract<DecisionAction, { action: "SHORTEN_NEXT_TASK" }> | undefined {
  return decision?.actions.find(
    (action): action is Extract<DecisionAction, { action: "SHORTEN_NEXT_TASK" }> =>
      action.action === "SHORTEN_NEXT_TASK",
  );
}

function reverseRoadmapInactivityChanges(
  roadmap: Roadmap,
  inactivityDecision: Decision | undefined,
): Roadmap {
  const shortenAction = findShortenNextTaskAction(inactivityDecision);

  if (!shortenAction) {
    return roadmap;
  }

  const restoredMinutes = Math.round(
    shortenAction.newMinutes / thresholds.nextTaskShortenFactor,
  );
  const hadVersionBump = inactivityDecision?.actions.some(
    (action) => action.action === "UPDATE_ROADMAP_VERSION",
  );

  return {
    ...roadmap,
    version:
      hadVersionBump && roadmap.version > demo.initialRoadmapVersion
        ? roadmap.version - 1
        : roadmap.version,
    tasks: roadmap.tasks.map((task) =>
      task.id === shortenAction.taskId
        ? { ...task, estimatedMinutes: restoredMinutes }
        : task,
    ),
  };
}

function reverseTwinInactivityChanges(state: AppState): LearningTwin {
  const twin = structuredClone(state.twin!);
  const hasInactivity = state.decisions.some((decision) =>
    decision.reasons.includes("INACTIVITY_ESCALATION"),
  );

  if (!hasInactivity) {
    return twin;
  }

  return {
    ...twin,
    inactivityDays: 0,
    currentStreakDays: resolvePreInactivityStreak(state),
    dropoutRisk: capScore(twin.dropoutRisk - thresholds.dropoutRiskIncreaseOnInactivity),
    consistencyScore: capScore(
      twin.consistencyScore + thresholds.consistencyDecreaseOnInactivity,
    ),
    lastActiveAt: resolvePreInactivityLastActiveAt(state),
  };
}

/** Fallback when no pre-fast-forward snapshot was persisted (e.g. hard refresh while inactive). */
export function deriveEngagementTimelineBaseline(
  state: AppState,
): EngagementTimelineBaseline | null {
  if (!state.demoMode || !state.twin || !state.roadmap) {
    return null;
  }

  const lastWeakQuizIndex = findLastWeakQuizDecisionIndex(state);
  if (
    lastWeakQuizIndex < 0 ||
    !hasInactivityAfterDecisionIndex(state, lastWeakQuizIndex)
  ) {
    return null;
  }

  const inactivityDecision = state.decisions.find((decision) =>
    decision.reasons.includes("INACTIVITY_ESCALATION"),
  );

  return {
    twin: reverseTwinInactivityChanges(state),
    roadmap: reverseRoadmapInactivityChanges(
      structuredClone(state.roadmap),
      inactivityDecision,
    ),
    decisions: state.decisions.filter(
      (decision) => !decision.reasons.includes("INACTIVITY_ESCALATION"),
    ),
    nudges: state.nudges.filter((nudge) => !isInactivityNudge(nudge)),
    learnerEvents: state.learnerEvents.filter(
      (event) => event.type !== "INACTIVITY_TICK",
    ),
  };
}

export function resolveEngagementTimelineBaseline(
  state: AppState,
): EngagementTimelineBaseline | null {
  return (
    state.engagementTimelineBaseline ??
    deriveEngagementTimelineBaseline(state)
  );
}

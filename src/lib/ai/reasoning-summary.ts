import type { Decision } from "@/types/decisions";
import type { Nudge } from "@/types/nudge";
import type { AppState } from "@/stores/store-types";
import {
  selectDecisionTransparency,
  selectLatestDecision,
  selectWeakTopics,
  selectWeakestTopic,
} from "@/stores/selectors";

export interface GoalAwareAdaptation {
  trigger: string;
  whatChanged: string;
  whyChanged: string;
  goalImpact: string;
  goalLabel: string;
}

export interface AssessmentReasoningSummary {
  goalLabel: string;
  signalDetected: string;
  learningTwinUpdate: string;
  decisionMade: string;
  expectedBenefit: string;
}

export interface EnrichedNudgeContext {
  signalLabel: string;
  signalDetail: string;
  weakestTopic: string;
  targetOutcome: string;
}

export function selectLearnerGoalLabel(state: Pick<AppState, "twin">): string {
  return state.twin?.goal.title ?? "your certification goal";
}

export function withGoalReference(message: string, goalLabel: string): string {
  const trimmed = message.trim().replace(/\.$/, "");
  if (trimmed.toLowerCase().includes(goalLabel.toLowerCase().slice(0, 20))) {
    return `${trimmed}.`;
  }
  return `${trimmed} — supporting ${goalLabel}.`;
}

export function selectGoalAwareAdaptation(
  state: AppState,
  decision: Decision | null = selectLatestDecision(state),
): GoalAwareAdaptation | null {
  const transparency = decision ? selectDecisionTransparency(state, decision) : selectDecisionTransparency(state);
  if (!transparency) {
    return null;
  }

  const goalLabel = selectLearnerGoalLabel(state);

  return {
    trigger: transparency.trigger,
    whatChanged: transparency.whatChanged,
    whyChanged: withGoalReference(transparency.why, goalLabel),
    goalImpact: withGoalReference(transparency.expectedBenefit, goalLabel),
    goalLabel,
  };
}

export function selectAssessmentReasoningSummary(
  state: AppState,
  score: number,
): AssessmentReasoningSummary {
  const goalLabel = selectLearnerGoalLabel(state);
  const transparency = selectDecisionTransparency(state);
  const latestDecision = selectLatestDecision(state);
  const weaknesses = selectWeakTopics(state);
  const weakTopic = weaknesses[0];

  const signalDetected = transparency?.trigger ?? `Assessment score: ${score}%`;
  let learningTwinUpdate = "Quiz signal stored — learner profile refreshed.";
  let decisionMade = transparency?.whatChanged ?? "No roadmap changes required.";
  let expectedBenefit =
    transparency?.expectedBenefit ?? "Maintain steady progress toward exam readiness.";

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD") && weakTopic) {
    learningTwinUpdate = `${weakTopic.topicName} marked weakest at ${weakTopic.score}% — focus area updated.`;
    expectedBenefit = "Close the gap before harder topics so your timeline stays achievable.";
  } else if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    learningTwinUpdate = "Topic promoted to strengths — remedial flag cleared.";
    expectedBenefit = "Skip repetition and advance toward advanced exam domains.";
  } else if (score >= 70) {
    learningTwinUpdate = "Score recorded — retention signal added to your profile.";
  } else if (weakTopic) {
    learningTwinUpdate = `${weakTopic.topicName} flagged at ${score}% — focus area updated.`;
  }

  if (latestDecision && latestDecision.actions.length === 0) {
    decisionMade = "Plan reviewed — current path still fits your profile.";
  }

  return {
    goalLabel,
    signalDetected,
    learningTwinUpdate,
    decisionMade,
    expectedBenefit: withGoalReference(expectedBenefit, goalLabel),
  };
}

export function selectEnrichedNudgeContext(state: AppState, nudge: Nudge): EnrichedNudgeContext {
  const goalLabel = selectLearnerGoalLabel(state);
  const weak =
    selectWeakestTopic(state) ??
    selectWeakTopics(state)[0] ??
    state.twin?.knownChallenges[0];
  const latestDecision = selectLatestDecision(state);
  const inactivityDays = state.twin?.inactivityDays ?? 0;

  const isInactivity =
    nudge.id.includes("inactivity") ||
    latestDecision?.reasons.includes("INACTIVITY_ESCALATION") ||
    /inactive/i.test(nudge.body);

  if (isInactivity) {
    return {
      signalLabel: "Inactivity signal",
      signalDetail: `${Math.max(inactivityDays, 3)} days away — dropout risk increased.`,
      weakestTopic: weak?.topicName ?? "VPC Networking",
      targetOutcome: goalLabel,
    };
  }

  const performanceDetail =
    transparencyTrigger(state) ??
    (weak ? `${weak.topicName} quiz below threshold` : "Recent assessment flagged a gap");

  return {
    signalLabel: "Performance signal",
    signalDetail: performanceDetail,
    weakestTopic: weak?.topicName ?? "your focus topic",
    targetOutcome: goalLabel,
  };
}

function transparencyTrigger(state: AppState): string | null {
  return selectDecisionTransparency(state)?.trigger ?? null;
}

export function selectDecisionGoalLine(state: AppState, decision: Decision | null): string | null {
  if (!decision) {
    return null;
  }

  const goalLabel = selectLearnerGoalLabel(state);
  return `Reasoning toward ${goalLabel}: ${decision.explanation.split(".")[0]}.`;
}

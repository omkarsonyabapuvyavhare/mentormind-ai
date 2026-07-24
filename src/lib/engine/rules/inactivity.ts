import { thresholds } from "@/constants/thresholds";
import {
  capScore,
  createInactivityDecisionId,
  createNudgeId,
  findNextPendingTask,
  hasNudgeWithId,
  nextRoadmapVersion,
  shortenTaskDuration,
} from "@/lib/engine/helpers";
import type { LearnerEventPayload } from "@/types/events";
import type { DecisionAction, EngineContext, ReasonCode } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";
import type { ExplanationContext } from "@/lib/engine/explain";

export interface RuleResult {
  actions: DecisionAction[];
  reasons: ReasonCode[];
  twinPatch: Partial<LearningTwin>;
  decisionId: string;
  explanationContext: ExplanationContext;
}

export function evaluateInactivity(
  event: Extract<LearnerEventPayload, { type: "INACTIVITY_TICK" }>,
  context: EngineContext,
): RuleResult | null {
  if (event.days < thresholds.inactivityTriggerDays) {
    return null;
  }

  const decisionId = createInactivityDecisionId(event);
  const nudgeId = createNudgeId(event);

  if (hasNudgeWithId(context.nudges, nudgeId)) {
    return {
      actions: [],
      reasons: [],
      twinPatch: { updatedAt: event.timestamp },
      decisionId,
      explanationContext: {},
    };
  }

  const nextTask = findNextPendingTask(context.roadmap);
  const actions: DecisionAction[] = [];
  const reasons: ReasonCode[] = ["INACTIVITY_ESCALATION"];

  const newDropoutRisk = capScore(
    context.twin.dropoutRisk + thresholds.dropoutRiskIncreaseOnInactivity,
  );
  const newConsistency = capScore(
    context.twin.consistencyScore - thresholds.consistencyDecreaseOnInactivity,
  );

  actions.push({
    action: "UPDATE_DROPOUT_RISK",
    dropoutRisk: newDropoutRisk,
  });

  let shortenedMinutes: number | undefined;

  if (nextTask) {
    shortenedMinutes = shortenTaskDuration(
      nextTask.estimatedMinutes,
      thresholds.nextTaskShortenFactor,
      thresholds.minTaskDurationMinutes,
    );

    actions.push({
      action: "SHORTEN_NEXT_TASK",
      taskId: nextTask.id,
      newMinutes: shortenedMinutes,
    });

    actions.push({
      action: "UPDATE_ROADMAP_VERSION",
      version: nextRoadmapVersion(context.roadmap),
    });
  }

  actions.push({
    action: "SEND_NUDGE",
    nudge: {
      id: nudgeId,
      title: "Stay on track with your AWS goal",
      body: `You've been inactive for three days. To keep your AWS certification plan achievable, I shortened your next session and selected a focused VPC revision task.`,
      severity: "warning",
      createdAt: event.timestamp,
      read: false,
    },
  });

  return {
    actions,
    reasons,
    twinPatch: {
      inactivityDays: event.days,
      currentStreakDays: 0,
      dropoutRisk: newDropoutRisk,
      consistencyScore: newConsistency,
      lastActiveAt: event.timestamp,
      updatedAt: event.timestamp,
    },
    decisionId,
    explanationContext: {
      inactivityDays: event.days,
      shortenedMinutes,
      topicName: "VPC Networking",
    },
  };
}

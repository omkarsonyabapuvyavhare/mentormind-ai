import { thresholds } from "@/constants/thresholds";
import {
  capScore,
  createQuizAttemptId,
  buildQuizAttemptFromEvent,
  createQuizDecisionId,
  getTopicName,
  hasQuizAttempt,
  nextRoadmapVersion,
} from "@/lib/engine/helpers";
import type { ExplanationContext } from "@/lib/engine/explain";
import type { LearnerEventPayload } from "@/types/events";
import type { DecisionAction, EngineContext, ReasonCode } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";

export interface RuleResult {
  actions: DecisionAction[];
  reasons: ReasonCode[];
  twinPatch: Partial<LearningTwin>;
  decisionId: string;
  explanationContext: ExplanationContext;
}

const REMEDIAL_TASK_TYPES = new Set(["revision", "lab"]);

export function evaluateMasteryRecovery(
  event: Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }>,
  context: EngineContext,
): RuleResult | null {
  if (event.score < thresholds.masteryScore) {
    return null;
  }

  const isWeak = context.twin.weaknesses.some(
    (weakness) => weakness.topicId === event.topicId,
  );

  if (!isWeak) {
    return null;
  }

  const decisionId = createQuizDecisionId(event);
  const attemptId = createQuizAttemptId(event);
  const topicName = getTopicName(event.topicId);

  if (hasQuizAttempt(context.twin.quizHistory, attemptId)) {
    return {
      actions: [],
      reasons: [],
      twinPatch: { updatedAt: event.timestamp },
      decisionId,
      explanationContext: {},
    };
  }

  const actions: DecisionAction[] = [];
  const reasons: ReasonCode[] = [
    "QUIZ_MASTERY_ACHIEVED",
    "REVISION_NO_LONGER_NEEDED",
    "ROADMAP_ACCELERATED",
  ];

  const newDropoutRisk = capScore(
    context.twin.dropoutRisk - thresholds.dropoutRiskDecreaseOnMastery,
  );
  const newConsistency = capScore(
    context.twin.consistencyScore + thresholds.consistencyIncreaseOnMastery,
  );

  const quizAttempt = buildQuizAttemptFromEvent(event, attemptId);

  const updatedQuizHistory = hasQuizAttempt(context.twin.quizHistory, attemptId)
    ? context.twin.quizHistory
    : [...context.twin.quizHistory, quizAttempt];

  actions.push({
    action: "MARK_STRENGTH",
    topicId: event.topicId,
    topicName,
    score: event.score,
  });

  const pendingRemedialTaskIds = context.roadmap.tasks
    .filter(
      (task) =>
        task.topicId === event.topicId &&
        REMEDIAL_TASK_TYPES.has(task.type) &&
        task.status === "pending" &&
        task.injectedBy !== undefined,
    )
    .map((task) => task.id);

  if (pendingRemedialTaskIds.length > 0) {
    actions.push({
      action: "REMOVE_TASKS",
      taskIds: pendingRemedialTaskIds,
    });
  }

  const advancedTopicId = thresholds.advancedUnlockTopicId;
  const advancedTask = context.roadmap.tasks.find(
    (task) => task.topicId === advancedTopicId && !task.unlocked,
  );

  if (advancedTask) {
    actions.push({
      action: "UNLOCK_CONTENT",
      topicIds: [advancedTopicId],
    });
  }

  actions.push({
    action: "COMPRESS_ROADMAP",
    daysSaved: thresholds.roadmapAccelerationDays,
  });

  actions.push({
    action: "UPDATE_DROPOUT_RISK",
    dropoutRisk: newDropoutRisk,
  });

  actions.push({
    action: "UPDATE_ROADMAP_VERSION",
    version: nextRoadmapVersion(context.roadmap),
  });

  const updatedWeaknesses = context.twin.weaknesses.filter(
    (weakness) => weakness.topicId !== event.topicId,
  );

  const existingStrengthIndex = context.twin.strengths.findIndex(
    (strength) => strength.topicId === event.topicId,
  );
  const strengthEntry = {
    topicId: event.topicId,
    topicName,
    score: event.score,
    lastAssessedAt: event.timestamp,
  };

  const updatedStrengths =
    existingStrengthIndex >= 0
      ? context.twin.strengths.map((strength, index) =>
          index === existingStrengthIndex ? strengthEntry : strength,
        )
      : [...context.twin.strengths, strengthEntry];

  return {
    actions,
    reasons,
    twinPatch: {
      weaknesses: updatedWeaknesses,
      strengths: updatedStrengths,
      quizHistory: updatedQuizHistory,
      dropoutRisk: newDropoutRisk,
      consistencyScore: newConsistency,
      currentStreakDays: Math.max(context.twin.currentStreakDays, 1),
      learningVelocity: context.twin.learningVelocity + 0.5,
      lastActiveAt: event.timestamp,
      updatedAt: event.timestamp,
    },
    decisionId,
    explanationContext: {
      topicName,
      score: event.score,
      daysDelta: thresholds.roadmapAccelerationDays,
      advancedTaskUnlocked: advancedTask !== undefined,
    },
  };
}

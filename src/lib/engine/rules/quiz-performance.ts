import { thresholds } from "@/constants/thresholds";
import {
  capScore,
  createQuizAttemptId,
  createQuizDecisionId,
  findMilestoneForTopic,
  findNextDependentMilestone,
  getTopicName,
  hasInjectedTasksForDecision,
  hasQuizAttempt,
  nextRoadmapVersion,
} from "@/lib/engine/helpers";
import type { ExplanationContext } from "@/lib/engine/explain";
import type { LearnerEventPayload } from "@/types/events";
import type { DecisionAction, EngineContext, ReasonCode } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";
import type { NewLearningTask } from "@/types/roadmap";

export interface RuleResult {
  actions: DecisionAction[];
  reasons: ReasonCode[];
  twinPatch: Partial<LearningTwin>;
  decisionId: string;
  explanationContext: ExplanationContext;
}

export function evaluateQuizPerformance(
  event: Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }>,
  context: EngineContext,
): RuleResult | null {
  if (event.score >= thresholds.weakQuizScore) {
    return null;
  }

  const decisionId = createQuizDecisionId(event);
  const attemptId = createQuizAttemptId(event);
  const topicName = getTopicName(event.topicId);

  if (hasInjectedTasksForDecision(context.roadmap, decisionId)) {
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
    "QUIZ_BELOW_THRESHOLD",
    "MILESTONE_DELAYED_FOR_REMEDIATION",
  ];

  const newDropoutRisk = capScore(
    context.twin.dropoutRisk + thresholds.dropoutRiskIncreaseOnQuizFail,
  );
  const newConsistency = capScore(
    context.twin.consistencyScore - thresholds.consistencyDecreaseOnQuizFail,
  );

  const quizAttempt = {
    id: attemptId,
    topicId: event.topicId,
    score: event.score,
    totalQuestions: event.totalQuestions,
    completedAt: event.timestamp,
  };

  const updatedQuizHistory = hasQuizAttempt(context.twin.quizHistory, attemptId)
    ? context.twin.quizHistory
    : [...context.twin.quizHistory, quizAttempt];

  actions.push({
    action: "MARK_WEAKNESS",
    topicId: event.topicId,
    topicName,
    score: event.score,
  });

  const topicMilestone = findMilestoneForTopic(context.roadmap, event.topicId);
  const milestoneId = topicMilestone?.id ?? "ms-week-4";

  const remedialTasks: NewLearningTask[] = [];

  for (let index = 1; index <= thresholds.revisionTasksToAdd; index += 1) {
    remedialTasks.push({
      milestoneId,
      topicId: event.topicId,
      type: "revision",
      title: `${topicName} Revision Session ${index}`,
      estimatedMinutes: 30,
      status: "pending",
      priority: 10 + index,
      injectedBy: decisionId,
      unlocked: true,
    });
  }

  for (let index = 0; index < thresholds.labTasksToAdd; index += 1) {
    remedialTasks.push({
      milestoneId,
      topicId: event.topicId,
      type: "lab",
      title: `${topicName} Practical Lab`,
      estimatedMinutes: 60,
      status: "pending",
      priority: 20,
      injectedBy: decisionId,
      unlocked: true,
    });
  }

  actions.push({ action: "ADD_TASKS", tasks: remedialTasks });

  const nextMilestone = findNextDependentMilestone(context.roadmap, event.topicId);
  if (nextMilestone) {
    actions.push({
      action: "SHIFT_MILESTONE",
      milestoneId: nextMilestone.id,
      daysDelta: thresholds.milestoneDelayDays,
    });
  }

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

  return {
    actions,
    reasons,
    twinPatch: {
      weaknesses: [
        ...updatedWeaknesses,
        {
          topicId: event.topicId,
          topicName,
          score: event.score,
          lastAssessedAt: event.timestamp,
        },
      ],
      quizHistory: updatedQuizHistory,
      dropoutRisk: newDropoutRisk,
      consistencyScore: newConsistency,
      lastActiveAt: event.timestamp,
      updatedAt: event.timestamp,
    },
    decisionId,
    explanationContext: {
      topicName,
      score: event.score,
      revisionCount: thresholds.revisionTasksToAdd,
      labCount: thresholds.labTasksToAdd,
      daysDelta: thresholds.milestoneDelayDays,
    },
  };
}

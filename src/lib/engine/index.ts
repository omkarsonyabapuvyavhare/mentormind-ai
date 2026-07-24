import { getTopicName } from "@/lib/engine/helpers";
import { buildExplanation } from "@/lib/engine/explain";
import { evaluateInactivity } from "@/lib/engine/rules/inactivity";
import { evaluateMasteryRecovery } from "@/lib/engine/rules/mastery-recovery";
import { evaluateQuizPerformance } from "@/lib/engine/rules/quiz-performance";
import type { LearnerEventPayload } from "@/types/events";
import type { Decision, EngineContext, EngineResult } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";
import type { ExplanationContext } from "@/lib/engine/explain";

function buildResult(
  event: LearnerEventPayload,
  decisionId: string,
  actions: EngineResult["actions"],
  reasons: Decision["reasons"],
  twinPatch: Partial<LearningTwin>,
  explanationContext: ExplanationContext,
): EngineResult {
  const decision: Decision = {
    id: decisionId,
    eventType: event.type,
    actions,
    reasons,
    explanation: buildExplanation(reasons, explanationContext, event),
    createdAt: event.timestamp,
  };

  return {
    twinPatch: { ...twinPatch, updatedAt: event.timestamp },
    actions,
    decision,
  };
}

function emptyResult(event: LearnerEventPayload, decisionId: string): EngineResult {
  return buildResult(event, decisionId, [], [], { updatedAt: event.timestamp }, {});
}

function neutralQuizResult(
  event: Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }>,
): EngineResult {
  const decisionId = `decision-quiz-neutral-${event.topicId}-${event.score}-${event.timestamp}`;

  return buildResult(
    event,
    decisionId,
    [],
    [],
    {
      lastActiveAt: event.timestamp,
      updatedAt: event.timestamp,
    },
    {
      topicName: getTopicName(event.topicId),
      score: event.score,
    },
  );
}

/**
 * Deterministic adaptation entry point.
 * Never mutates the input context.
 */
export function evaluate(event: LearnerEventPayload, context: EngineContext): EngineResult {
  switch (event.type) {
    case "QUIZ_COMPLETED": {
      const mastery = evaluateMasteryRecovery(event, context);
      if (mastery) {
        return buildResult(
          event,
          mastery.decisionId,
          mastery.actions,
          mastery.reasons,
          mastery.twinPatch,
          mastery.explanationContext,
        );
      }

      const performance = evaluateQuizPerformance(event, context);
      if (performance) {
        return buildResult(
          event,
          performance.decisionId,
          performance.actions,
          performance.reasons,
          performance.twinPatch,
          performance.explanationContext,
        );
      }

      return neutralQuizResult(event);
    }
    case "INACTIVITY_TICK": {
      const inactivity = evaluateInactivity(event, context);
      if (!inactivity || inactivity.reasons.length === 0) {
        const decisionId = `decision-inactivity-${event.days}-${event.timestamp}`;
        return emptyResult(event, decisionId);
      }

      return buildResult(
        event,
        inactivity.decisionId,
        inactivity.actions,
        inactivity.reasons,
        inactivity.twinPatch,
        inactivity.explanationContext,
      );
    }
    default:
      return emptyResult(event, `decision-${event.type.toLowerCase()}-${event.timestamp}`);
  }
}

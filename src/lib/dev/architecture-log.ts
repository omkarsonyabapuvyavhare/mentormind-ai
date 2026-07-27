import type { EngineResult } from "@/types/decisions";
import type { LearnerEventPayload } from "@/types/events";

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Development-only logs for architecture boundaries. Never logs secrets. */
export function logGeminiIntentParsed(payload: Record<string, unknown>): void {
  if (!isDevelopment()) {
    return;
  }

  console.info("[Gemini] Intent parsed", payload);
}

export function logGeminiRoadmapGenerated(payload: Record<string, unknown>): void {
  if (!isDevelopment()) {
    return;
  }

  console.info("[Gemini] Roadmap generated", payload);
}

export function logGeminiLessonGenerated(payload: Record<string, unknown>): void {
  if (!isDevelopment()) {
    return;
  }

  console.info("[Gemini] Lesson generated", payload);
}

export function logAssessmentBuiltFromLesson(payload: Record<string, unknown>): void {
  if (!isDevelopment()) {
    return;
  }

  console.info("[Assessment] Built from lesson", payload);
}

export function logDecisionEngineResult(
  event: LearnerEventPayload,
  result: EngineResult,
): void {
  if (!isDevelopment()) {
    return;
  }

  if (event.type === "QUIZ_COMPLETED") {
    console.info("[Decision Engine] Quiz evaluated", {
      topicId: event.topicId,
      score: event.score,
      reasons: result.decision.reasons,
      actionCount: result.actions.length,
    });

    if (result.decision.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
      console.info("[Decision Engine] Weakness detected", {
        topicId: event.topicId,
        score: event.score,
      });
    }

    if (
      result.decision.reasons.includes("QUIZ_MASTERY_ACHIEVED")
    ) {
      console.info("[Decision Engine] Mastery detected", {
        topicId: event.topicId,
        score: event.score,
      });
    }
  }

  if (event.type === "INACTIVITY_TICK") {
    console.info("[Decision Engine] Inactivity evaluated", {
      days: event.days,
      reasons: result.decision.reasons,
      actionCount: result.actions.length,
    });
  }

  const roadmapMutatingActions = new Set([
    "ADD_TASKS",
    "REMOVE_TASKS",
    "SHIFT_MILESTONE",
    "UNLOCK_CONTENT",
    "COMPRESS_ROADMAP",
    "SHORTEN_NEXT_TASK",
    "UPDATE_ROADMAP_VERSION",
  ]);

  if (result.actions.some((action) => roadmapMutatingActions.has(action.action))) {
    console.info("[Decision Engine] Roadmap updated", {
      eventType: event.type,
      reasons: result.decision.reasons,
      actions: result.actions.map((action) => action.action),
    });
  }

  if (result.actions.some((action) => action.action === "MARK_WEAKNESS")) {
    console.info("[Decision Engine] Weakness detected", {
      eventType: event.type,
      reasons: result.decision.reasons,
    });
  }

  if (result.actions.some((action) => action.action === "MARK_STRENGTH")) {
    console.info("[Decision Engine] Strength recorded", {
      eventType: event.type,
      reasons: result.decision.reasons,
    });
  }
}

/** Development-only transparency log for API source/fallbackReason. */
export function logApiFallbackTransparency(
  endpoint: string,
  payload: Record<string, unknown> & { source: string; fallbackReason?: string },
): void {
  if (!isDevelopment()) {
    return;
  }

  if (payload.source === "ai") {
    console.info(`[API] ${endpoint}`, { source: payload.source });
    return;
  }

  console.info(`[API Fallback] ${endpoint}`, payload);
}

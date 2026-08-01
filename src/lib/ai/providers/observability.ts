import "server-only";

import { failoverReasonLabel } from "@/lib/ai/providers/classify-error";
import type { AiProviderName, FailoverReason } from "@/lib/ai/providers/types";

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function logAiProviderSuccess(payload: {
  flow: "intent" | "roadmap" | "lesson";
  provider: AiProviderName | "deterministic";
  model?: string;
  goalId?: string;
  topicId?: string;
}): void {
  if (!isDevelopment()) {
    return;
  }

  const label =
    payload.provider === "gemini"
      ? "Gemini"
      : payload.provider === "grok"
        ? "Grok"
        : "Deterministic";

  console.info(
    [
      "----------------------------------------",
      "Provider:",
      label,
      "",
      "Flow:",
      payload.flow,
      ...(payload.model ? ["", "Model:", payload.model] : []),
      ...(payload.goalId ? ["", "GoalId:", payload.goalId] : []),
      ...(payload.topicId ? ["", "TopicId:", payload.topicId] : []),
      "----------------------------------------",
    ].join("\n"),
  );
}

export function logAiProviderFailover(payload: {
  flow: "intent" | "roadmap" | "lesson";
  from: AiProviderName;
  to: AiProviderName;
  reason: FailoverReason;
  message?: string;
  goalId?: string;
  topicId?: string;
}): void {
  if (!isDevelopment()) {
    return;
  }

  console.warn(
    [
      "----------------------------------------",
      "Provider failover",
      "",
      "From:",
      payload.from === "gemini" ? "Gemini" : "Grok",
      "",
      "To:",
      payload.to === "gemini" ? "Gemini" : "Grok",
      "",
      "Failover reason:",
      failoverReasonLabel(payload.reason),
      ...(payload.message ? ["", "Detail:", payload.message] : []),
      ...(payload.goalId ? ["", "GoalId:", payload.goalId] : []),
      ...(payload.topicId ? ["", "TopicId:", payload.topicId] : []),
      "----------------------------------------",
    ].join("\n"),
  );
}

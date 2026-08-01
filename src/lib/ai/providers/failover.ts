import "server-only";

import {
  getPrimaryProviderName,
  getSecondaryProviderName,
} from "@/lib/ai/providers/config";
import { geminiProvider } from "@/lib/ai/providers/gemini-provider";
import { grokProvider } from "@/lib/ai/providers/grok-provider";
import { logAiProviderFailover } from "@/lib/ai/providers/observability";
import type {
  AIProvider,
  AiProviderName,
  FailoverReason,
  JsonCompletionRequest,
} from "@/lib/ai/providers/types";

export function getProviderByName(name: AiProviderName): AIProvider {
  return name === "grok" ? grokProvider : geminiProvider;
}

export function getPrimaryProvider(): AIProvider {
  return getProviderByName(getPrimaryProviderName());
}

export function getSecondaryProvider(): AIProvider {
  return getProviderByName(getSecondaryProviderName());
}

export interface ProviderAttemptFailure {
  provider: AiProviderName;
  reason: FailoverReason;
  message: string;
}

export interface ProviderPipelineSuccess<T> {
  ok: true;
  provider: AiProviderName;
  model: string;
  data: T;
  failoverFrom?: ProviderAttemptFailure;
}

export interface ProviderPipelineFailure {
  ok: false;
  reason: FailoverReason;
  message: string;
  attempts: ProviderAttemptFailure[];
}

export type ProviderPipelineOutcome<T> =
  | ProviderPipelineSuccess<T>
  | ProviderPipelineFailure;

export type ProviderFinalizeResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: FailoverReason; message: string };

/**
 * Gemini (primary) → Grok (secondary) failover.
 * `finalize` runs the shared normalize + Zod + quality checks for whichever
 * provider returned text. Validation failures also trigger secondary.
 */
export async function runWithProviderFailover<T>(options: {
  request: Omit<JsonCompletionRequest, "context"> & {
    context?: JsonCompletionRequest["context"];
  };
  finalize: (
    rawText: string,
    provider: AiProviderName,
  ) => Promise<ProviderFinalizeResult<T>> | ProviderFinalizeResult<T>;
}): Promise<ProviderPipelineOutcome<T>> {
  const primary = getPrimaryProvider();
  const secondary = getSecondaryProvider();
  const attempts: ProviderAttemptFailure[] = [];
  const flow = options.request.context?.flow ?? "lesson";

  const attemptProvider = async (
    provider: AIProvider,
  ): Promise<ProviderPipelineOutcome<T>> => {
    if (!provider.isConfigured()) {
      const failure: ProviderAttemptFailure = {
        provider: provider.name,
        reason: "missing_api_key",
        message: `${provider.name} API key is not configured.`,
      };
      attempts.push(failure);
      return {
        ok: false,
        reason: failure.reason,
        message: failure.message,
        attempts: [...attempts],
      };
    }

    const completion = await provider.generateJson({
      ...options.request,
      context: options.request.context,
    });

    if (!completion.ok) {
      const failure: ProviderAttemptFailure = {
        provider: completion.provider,
        reason: completion.reason,
        message: completion.message,
      };
      attempts.push(failure);
      return {
        ok: false,
        reason: failure.reason,
        message: failure.message,
        attempts: [...attempts],
      };
    }

    const finalized = await options.finalize(completion.text, completion.provider);

    if (!finalized.ok) {
      const failure: ProviderAttemptFailure = {
        provider: completion.provider,
        reason: finalized.reason,
        message: finalized.message,
      };
      attempts.push(failure);
      return {
        ok: false,
        reason: failure.reason,
        message: failure.message,
        attempts: [...attempts],
      };
    }

    return {
      ok: true,
      provider: completion.provider,
      model: completion.model,
      data: finalized.data,
      failoverFrom: attempts[0],
    };
  };

  const primaryOutcome = await attemptProvider(primary);
  if (primaryOutcome.ok) {
    return primaryOutcome;
  }

  if (secondary.name !== primary.name && secondary.isConfigured()) {
    const lastFailure = attempts[attempts.length - 1];
    logAiProviderFailover({
      flow,
      from: primary.name,
      to: secondary.name,
      reason: lastFailure?.reason ?? primaryOutcome.reason,
      message: lastFailure?.message ?? primaryOutcome.message,
      goalId: options.request.context?.goalId,
      topicId: options.request.context?.topicId,
    });

    const secondaryOutcome = await attemptProvider(secondary);
    if (secondaryOutcome.ok) {
      return {
        ...secondaryOutcome,
        failoverFrom: attempts[0],
      };
    }

    return secondaryOutcome;
  }

  return primaryOutcome;
}

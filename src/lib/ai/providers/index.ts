export type {
  AIProvider,
  AiProviderName,
  FailoverReason,
  JsonCompletionRequest,
  JsonCompletionResult,
} from "@/lib/ai/providers/types";

export {
  getGeminiApiKey,
  getGeminiModel,
  getGrokModel,
  getPrimaryProviderName,
  getSecondaryProviderName,
  getXaiApiKey,
  isAnyAiProviderConfigured,
  isGeminiConfigured,
  isGrokConfigured,
  resolveTimeoutMs,
} from "@/lib/ai/providers/config";

export {
  classifyPipelineFailure,
  classifyTransportError,
  failoverReasonLabel,
} from "@/lib/ai/providers/classify-error";

export { geminiProvider, GeminiProvider } from "@/lib/ai/providers/gemini-provider";
export { grokProvider, GrokProvider } from "@/lib/ai/providers/grok-provider";
export {
  getPrimaryProvider,
  getProviderByName,
  getSecondaryProvider,
  runWithProviderFailover,
  type ProviderAttemptFailure,
  type ProviderFinalizeResult,
  type ProviderPipelineFailure,
  type ProviderPipelineOutcome,
  type ProviderPipelineSuccess,
} from "@/lib/ai/providers/failover";
export { logAiProviderFailover, logAiProviderSuccess } from "@/lib/ai/providers/observability";

import {
  isAnyAiProviderConfigured,
  logAiProviderSuccess,
} from "@/lib/ai/providers";
import {
  buildDefaultParsedIntent,
  parseGoalIntentDeterministic,
} from "@/lib/onboarding/parse-intent-deterministic";
import { parseGoalIntentWithProviders } from "@/lib/onboarding/parse-intent-ai";
import {
  clampParsedGoalIntent,
  parsedGoalIntentSchema,
  type ParseIntentResponse,
} from "@/lib/onboarding/parse-intent-schema";

export async function parseLearnerIntent(text: string): Promise<ParseIntentResponse> {
  const normalized = text.trim();

  if (!normalized) {
    return {
      source: "deterministic",
      parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(buildDefaultParsedIntent())),
      fallbackReason: "empty-input",
    };
  }

  if (isAnyAiProviderConfigured()) {
    const aiParsed = await parseGoalIntentWithProviders(normalized);

    if (aiParsed.ok) {
      logAiProviderSuccess({
        flow: "intent",
        provider: aiParsed.provider,
        model: aiParsed.model,
      });

      return {
        source: "ai",
        parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(aiParsed.parsed)),
      };
    }

    const deterministicParsed =
      parseGoalIntentDeterministic(normalized) ?? buildDefaultParsedIntent();

    logAiProviderSuccess({
      flow: "intent",
      provider: "deterministic",
    });

    return {
      source: "deterministic",
      parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(deterministicParsed)),
      fallbackReason: aiParsed.reason || "validation",
    };
  }

  const deterministicParsed =
    parseGoalIntentDeterministic(normalized) ?? buildDefaultParsedIntent();

  return {
    source: "deterministic",
    parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(deterministicParsed)),
    fallbackReason: "missing-api-key",
  };
}

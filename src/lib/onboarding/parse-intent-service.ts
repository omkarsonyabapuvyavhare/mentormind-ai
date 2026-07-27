import {
  buildDefaultParsedIntent,
  parseGoalIntentDeterministic,
} from "@/lib/onboarding/parse-intent-deterministic";
import { isGeminiConfigured, parseGoalIntentWithGemini } from "@/lib/onboarding/parse-intent-ai";
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

  if (isGeminiConfigured()) {
    const aiParsed = await parseGoalIntentWithGemini(normalized);

    if (aiParsed) {
      return {
        source: "ai",
        parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(aiParsed)),
      };
    }

    const deterministicParsed =
      parseGoalIntentDeterministic(normalized) ?? buildDefaultParsedIntent();

    return {
      source: "deterministic",
      parsed: clampParsedGoalIntent(parsedGoalIntentSchema.parse(deterministicParsed)),
      fallbackReason: "validation",
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

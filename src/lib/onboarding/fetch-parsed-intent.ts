import {
  buildDefaultParsedIntent,
  parseGoalIntentDeterministic,
} from "@/lib/onboarding/parse-intent-deterministic";
import {
  clampParsedGoalIntent,
  parseIntentResponseSchema,
  parsedGoalIntentSchema,
  type ParseIntentResponse,
} from "@/lib/onboarding/parse-intent-schema";
import { GOAL_INTENT_MIN_LOADING_MS } from "@/lib/onboarding/goal-intent-constants";
import { logApiFallbackTransparency } from "@/lib/dev/architecture-log";

export function buildClientFallbackParseIntent(
  text: string,
  fallbackReason = "network",
): ParseIntentResponse {
  const normalized = text.trim();
  const parsed = parseGoalIntentDeterministic(normalized) ?? buildDefaultParsedIntent();
  const clampedParsed = clampParsedGoalIntent(parsedGoalIntentSchema.parse(parsed));

  const response: ParseIntentResponse = {
    source: "deterministic",
    parsed: clampedParsed,
    fallbackReason,
  };

  logApiFallbackTransparency("parse-intent", response);
  return response;
}

export async function fetchParsedIntent(text: string): Promise<ParseIntentResponse> {
  try {
    const response = await fetch("/api/onboarding/parse-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return buildClientFallbackParseIntent(text, "network");
    }

    const body: unknown = await response.json();
    const validated = parseIntentResponseSchema.safeParse(body);

    if (!validated.success) {
      return buildClientFallbackParseIntent(text, "invalid-response");
    }

    logApiFallbackTransparency("parse-intent", validated.data);
    return validated.data;
  } catch {
    return buildClientFallbackParseIntent(text, "network");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchParsedIntentWithMinimumDelay(
  text: string,
  minDelayMs = GOAL_INTENT_MIN_LOADING_MS,
): Promise<ParseIntentResponse> {
  const [result] = await Promise.all([fetchParsedIntent(text), delay(minDelayMs)]);
  return result;
}

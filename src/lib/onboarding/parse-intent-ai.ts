import "server-only";

import {
  classifyPipelineFailure,
  getGeminiModel,
  isGeminiConfigured,
  resolveTimeoutMs,
  runWithProviderFailover,
  type AiProviderName,
} from "@/lib/ai/providers";
import {
  clampParsedGoalIntent,
  parsedGoalIntentSchema,
  type ParsedGoalIntent,
} from "@/lib/onboarding/parse-intent-schema";

const DEFAULT_TIMEOUT_MS = 8_000;

const SYSTEM_PROMPT = `You extract structured learning goals from natural language for MentorMind AI.
Return JSON only with this exact shape:
{
  "goal": string,
  "domain": string,
  "goalCategory": "Programming" | "Cloud" | "DevOps" | "AI / Machine Learning" | "Data" | "Cybersecurity" | "Web Development" | "Mobile Development" | "General Technology" | "Business" | "Design" | "Unknown",
  "goalType": "Skill" | "Certification",
  "currentSkillLevel": "beginner" | "intermediate" | "advanced",
  "targetOutcome": string,
  "durationWeeks": number,
  "studyHoursPerWeek": number,
  "recommendedFocusAreas": string[]
}

Rules:
- Accept any learner goal. Never reject unknown goals.
- Preserve the learner's goal wording in "goal" whenever possible.
- Classify broad domains using goalCategory.
- Use goalType "Certification" for exam/cert prep goals and "Skill" for skill-building goals.
- Infer certification goals when mentioned (AWS SAA, Azure AZ-900, CKA, etc.).
- Convert daily study time to weekly hours when needed ("1 hour per day" -> 7).
- Recommend realistic focus areas for the stated goal and category.
- Keep strings concise and human-readable.`;

function resolveIntentTimeoutMs(): number {
  return resolveTimeoutMs("AI_INTENT_PARSE_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
}

function resolveModel(): string {
  return getGeminiModel();
}

/** Re-export for existing callers / tests. */
export { isGeminiConfigured } from "@/lib/ai/providers";

function logIntentProviderError(
  phase: "request" | "empty-response" | "invalid-json" | "schema-validation",
  error: unknown,
  provider?: AiProviderName,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const base = {
    phase,
    provider: provider ?? "unknown",
    model: resolveModel(),
    geminiApiKeyPresent: isGeminiConfigured(),
  };

  if (error instanceof Error) {
    const enriched = error as Error & {
      status?: number;
      statusCode?: number;
      code?: string | number;
    };

    console.warn("[parse-intent:provider:dev]", {
      ...base,
      errorName: enriched.name,
      errorMessage: enriched.message,
      httpStatus: enriched.status ?? enriched.statusCode ?? null,
      errorCode: enriched.code ?? null,
    });
    return;
  }

  console.warn("[parse-intent:provider:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
    httpStatus: null,
  });
}

function finalizeIntentFromProviderText(
  content: string,
  provider: AiProviderName,
):
  | { ok: true; data: ParsedGoalIntent }
  | { ok: false; reason: ReturnType<typeof classifyPipelineFailure>; message: string } {
  let raw: unknown;

  try {
    raw = JSON.parse(content);
  } catch (error) {
    logIntentProviderError("invalid-json", error, provider);
    return {
      ok: false,
      reason: classifyPipelineFailure("invalid-json"),
      message: error instanceof Error ? error.message : `Invalid JSON from ${provider}.`,
    };
  }

  const validated = parsedGoalIntentSchema.safeParse(raw);

  if (!validated.success) {
    const message =
      validated.error.issues[0]?.message ?? `${provider} JSON failed Zod validation.`;
    logIntentProviderError("schema-validation", new Error(message), provider);
    return {
      ok: false,
      reason: classifyPipelineFailure("schema-validation"),
      message,
    };
  }

  return { ok: true, data: clampParsedGoalIntent(validated.data) };
}

export interface ParseIntentAiSuccess {
  ok: true;
  parsed: ParsedGoalIntent;
  provider: AiProviderName;
  model: string;
}

export interface ParseIntentAiFailure {
  ok: false;
  reason: string;
  message: string;
}

/**
 * Parse learner intent with Gemini → Grok failover.
 * Returns null on total failure for backward-compatible callers.
 */
export async function parseGoalIntentWithGemini(text: string): Promise<ParsedGoalIntent | null> {
  const result = await parseGoalIntentWithProviders(text);
  return result.ok ? result.parsed : null;
}

export async function parseGoalIntentWithProviders(
  text: string,
): Promise<ParseIntentAiSuccess | ParseIntentAiFailure> {
  const outcome = await runWithProviderFailover({
    request: {
      systemInstruction: SYSTEM_PROMPT,
      userContent: text,
      timeoutMs: resolveIntentTimeoutMs(),
      context: { flow: "intent" },
    },
    finalize: (rawText, provider) => finalizeIntentFromProviderText(rawText, provider),
  });

  if (outcome.ok) {
    return {
      ok: true,
      parsed: outcome.data,
      provider: outcome.provider,
      model: outcome.model,
    };
  }

  logIntentProviderError("request", new Error(outcome.message));
  return {
    ok: false,
    reason: outcome.reason,
    message: outcome.message,
  };
}

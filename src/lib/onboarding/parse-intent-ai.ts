import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  clampParsedGoalIntent,
  parsedGoalIntentSchema,
  type ParsedGoalIntent,
} from "@/lib/onboarding/parse-intent-schema";

const DEFAULT_MODEL = "gemini-3-flash-preview";
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

function resolveTimeoutMs(): number {
  const raw = process.env.AI_INTENT_PARSE_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
}

function resolveModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function logGeminiProviderError(
  phase: "request" | "empty-response" | "invalid-json" | "schema-validation",
  error: unknown,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const model = resolveModel();
  const geminiApiKeyPresent = isGeminiConfigured();
  const base = {
    phase,
    model,
    geminiApiKeyPresent,
  };

  if (error instanceof Error) {
    const enriched = error as Error & {
      status?: number;
      statusCode?: number;
      code?: string | number;
      cause?: unknown;
    };

    console.warn("[parse-intent:gemini:dev]", {
      ...base,
      errorName: enriched.name,
      errorMessage: enriched.message,
      httpStatus: enriched.status ?? enriched.statusCode ?? null,
      errorCode: enriched.code ?? null,
    });
    return;
  }

  console.warn("[parse-intent:gemini:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
    httpStatus: null,
  });
}

export async function parseGoalIntentWithGemini(text: string): Promise<ParsedGoalIntent | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const client = new GoogleGenAI({ apiKey });
  const timeoutMs = resolveTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.models.generateContent({
      model: resolveModel(),
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });

    const content = response.text;

    if (!content) {
      logGeminiProviderError("empty-response", new Error("Gemini returned empty text content."));
      return null;
    }

    let raw: unknown;

    try {
      raw = JSON.parse(content);
    } catch (error) {
      logGeminiProviderError("invalid-json", error);
      return null;
    }

    const validated = parsedGoalIntentSchema.safeParse(raw);

    if (!validated.success) {
      logGeminiProviderError(
        "schema-validation",
        new Error(validated.error.issues[0]?.message ?? "Gemini JSON failed Zod validation."),
      );
      return null;
    }

    return clampParsedGoalIntent(validated.data);
  } catch (error) {
    logGeminiProviderError("request", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

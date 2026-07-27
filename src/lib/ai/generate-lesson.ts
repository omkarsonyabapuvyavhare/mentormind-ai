import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  aiLessonResponseSchema,
  validateAiLessonStructure,
  type AiLessonResponse,
} from "@/lib/ai/lesson-schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

import type { GoalCategory, GoalType } from "@/lib/goals/goal-identity";

export interface GenerateLessonInput {
  goalId: string;
  goalSlug: string;
  goalTitle: string;
  goalCategory: GoalCategory;
  goalType: GoalType;
  topicId: string;
  topicTitle: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  learningObjectives?: string[];
  preferredFormats: string[];
}

const DEFAULT_MODEL = "gemini-3-flash-preview";
const DEFAULT_TIMEOUT_MS = 12_000;

function resolveTimeoutMs(): number {
  const raw =
    process.env.AI_LESSON_GENERATE_TIMEOUT_MS ??
    process.env.AI_ROADMAP_GENERATE_TIMEOUT_MS ??
    process.env.AI_INTENT_PARSE_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
}

function resolveModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function buildSystemPrompt(): string {
  return `You generate a single focused lesson for MentorMind AI learners.
Return JSON only with this exact shape:
{
  "title": string,
  "estimatedMinutes": number,
  "learningObjectives": string[],
  "sections": [
    {
      "heading": string,
      "content": string,
      "practicalExample": string,
      "commonMistakes": string[],
      "summary": string[],
      "knowledgeCheck": [
        {
          "question": string,
          "options": [string, string, string, string],
          "correctIndex": number,
          "explanation": string,
          "conceptTag": string
        }
      ]
    }
  ]
}

Rules:
- Teach only the requested topic.
- Match the learner goal, category, type, and skill level.
- Programming lessons should include concise code examples when helpful.
- Cloud lessons should include architecture or service-design examples when helpful.
- Data topics should include dataset, SQL, or analysis examples when helpful.
- Framework lessons should include practical project-style examples when helpful.
- Never insert AWS-specific examples unless the goal is AWS-related.
- Never insert Azure-specific examples unless the goal is Azure-related.
- Never insert unrelated domain content for the learner's category.
- Do not guarantee certification success or exam outcomes.
- Keep total lesson length between 700 and 900 words across all sections.
- Use 2 to 4 sections.
- Include exactly 5 knowledge checks across all sections combined (not more, not fewer).
- Distribute knowledge checks across different concepts or learning objectives.
- Each knowledgeCheck must include conceptTag: a short slug for the concept tested (e.g. "variable-declaration", "primitive-types").
- Knowledge checks must test concepts taught in the lesson, aligned with learning objectives.
- Each knowledge check must have exactly 4 distinct options, one valid correctIndex, and a useful explanation.
- Never ask generic study-advice questions (e.g. "What is the best way to study?", "How should this connect to your plan?").
- Never ask unrelated-domain content for the learner's category.
- Return JSON only.`;
}

function buildUserPrompt(input: GenerateLessonInput): string {
  return JSON.stringify(
    {
      goalId: input.goalId,
      goalSlug: input.goalSlug,
      goalTitle: input.goalTitle,
      goalCategory: input.goalCategory,
      goalType: input.goalType,
      topicId: input.topicId,
      topicTitle: input.topicTitle,
      skillLevel: input.skillLevel,
      durationMinutes: input.durationMinutes,
      learningObjectives: input.learningObjectives ?? [],
      preferredFormats: input.preferredFormats,
    },
    null,
    2,
  );
}

export type GeminiLessonFailureReason =
  | "missing-api-key"
  | "empty-response"
  | "invalid-json"
  | "schema-validation"
  | "structure-validation"
  | "request-error";

export interface GeminiLessonSuccess {
  ok: true;
  data: AiLessonResponse;
}

export interface GeminiLessonFailure {
  ok: false;
  reason: GeminiLessonFailureReason;
  message: string;
}

function logGeminiLessonError(
  phase: GeminiLessonFailureReason,
  error: unknown,
  goalId: string,
  topicId: string,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const base = {
    phase,
    model: resolveModel(),
    goalId,
    topicId,
    geminiConfigured: isGeminiConfigured(),
  };

  if (error instanceof Error) {
    console.warn("[generate-lesson:gemini:dev]", {
      ...base,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("[generate-lesson:gemini:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
  });
}

export async function generateLessonWithGemini(
  input: GenerateLessonInput,
): Promise<GeminiLessonSuccess | GeminiLessonFailure> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing-api-key",
      message: "Gemini API key is not configured.",
    };
  }

  const client = new GoogleGenAI({ apiKey });
  const timeoutMs = resolveTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.models.generateContent({
      model: resolveModel(),
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: buildSystemPrompt(),
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });

    const content = response.text;

    if (!content) {
      const message = "Gemini returned empty lesson content.";
      logGeminiLessonError("empty-response", new Error(message), input.goalId, input.topicId);
      return { ok: false, reason: "empty-response", message };
    }

    let raw: unknown;

    try {
      raw = JSON.parse(content);
    } catch (error) {
      logGeminiLessonError("invalid-json", error, input.goalId, input.topicId);
      return {
        ok: false,
        reason: "invalid-json",
        message: error instanceof Error ? error.message : "Invalid JSON from Gemini.",
      };
    }

    const validated = aiLessonResponseSchema.safeParse(raw);

    if (!validated.success) {
      const message = validated.error.issues[0]?.message ?? "Gemini lesson failed Zod validation.";
      logGeminiLessonError("schema-validation", new Error(message), input.goalId, input.topicId);
      return { ok: false, reason: "schema-validation", message };
    }

    const structureError = validateAiLessonStructure(validated.data, {
      goalSlug: input.goalSlug,
      goalCategory: input.goalCategory,
    });

    if (structureError) {
      logGeminiLessonError(
        "structure-validation",
        new Error(structureError),
        input.goalId,
        input.topicId,
      );
      return { ok: false, reason: "structure-validation", message: structureError };
    }

    return { ok: true, data: validated.data };
  } catch (error) {
    logGeminiLessonError("request-error", error, input.goalId, input.topicId);
    return {
      ok: false,
      reason: "request-error",
      message: error instanceof Error ? error.message : "Gemini lesson request failed.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getLessonGeminiModel(): string {
  return resolveModel();
}

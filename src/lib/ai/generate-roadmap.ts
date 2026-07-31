import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  aiRoadmapResponseSchema,
  validateAiRoadmapStructure,
  type AiRoadmapResponse,
} from "@/lib/ai/roadmap-schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";

const DEFAULT_MODEL = "gemini-3-flash-preview";
const DEFAULT_TIMEOUT_MS = 15_000;

function resolveTimeoutMs(): number {
  const raw = process.env.AI_ROADMAP_GENERATE_TIMEOUT_MS ?? process.env.AI_INTENT_PARSE_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
}

function resolveModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function buildSystemPrompt(milestoneCount: number): string {
  return `You generate personalized learning roadmaps for MentorMind AI.
Return JSON only with this exact shape:
{
  "milestones": [
    {
      "title": string,
      "description": string,
      "week": number,
      "topicTitle": string,
      "tasks": [
        {
          "title": string,
          "type": "lesson" | "quiz" | "lab",
          "durationMinutes": number,
          "description": string,
          "learningObjectives": string[]
        }
      ]
    }
  ]
}

Rules:
- Generate a complete learning roadmap for the learner's goal.
- Progress from fundamentals to advanced concepts.
- Create content for the learner's actual goal, category, and type.
- Do not assume every learner is preparing for a certification.
- topicTitle values MUST be concrete technical concepts for the domain (examples: "Pandas DataFrames", "JSX", "WHERE", "NumPy Arrays").
- NEVER use generic topicTitle values such as "Foundations", "Core Concepts", "Introduction", "Basics", "Review", or "Applied Practice".
- learningObjectives must be technical and actionable. Never use "Explain key ideas in …".
- Prefer recommendedFocusAreas when they are domain-specific; otherwise infer a concrete curriculum from the goal.
- Programming goals should progress through fundamentals, practice, and projects.
- Cloud certification goals may include exam prep only when goalType is Certification.
- Never insert AWS-specific topics unless the goal is AWS-related.
- Never insert Azure-specific topics unless the goal is Azure-related.
- Never insert unrelated domain content (for example Python OOP in a React goal).
- Each milestone needs 2-4 tasks mixing lessons, quizzes, and labs where appropriate.
- Use human-readable topicTitle values; the app will slugify them.
- Week numbers must be unique and within the requested duration.
- Respect learner skill level and weekly study availability when scoping task depth.
- Do not guarantee certification success or make unsupported outcome claims.
- Keep titles concise and learner-friendly.
- Return JSON only.`;
}

function buildUserPrompt(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): string {
  const focusAreas = context?.recommendedFocusAreas?.length
    ? context.recommendedFocusAreas.join(", ")
    : "Infer sensible focus areas from the goal.";

  const knownChallenges =
    input.knownChallengeTopicIds.length > 0
      ? input.knownChallengeTopicIds.join(", ")
      : "None specified";

  return JSON.stringify(
    {
      goalSlug: input.goalSlug,
      goalTitle: input.goalTitle,
      goalCategory: input.goalCategory,
      goalType: input.goalType,
      goalId: input.goalId,
      learnerGoal: context?.goal ?? input.goalTitle,
      domain: context?.domain ?? input.goalCategory,
      currentSkillLevel: input.skillLevel,
      targetOutcome: context?.targetOutcome ?? "Reach the stated learning outcome",
      durationWeeks: input.durationWeeks,
      studyHoursPerWeek: input.studyHoursPerWeek,
      preferredFormats: input.preferredFormats,
      recommendedFocusAreas: focusAreas,
      knownChallenges,
    },
    null,
    2,
  );
}

export type GeminiRoadmapFailureReason =
  | "missing-api-key"
  | "empty-response"
  | "invalid-json"
  | "schema-validation"
  | "structure-validation"
  | "request-error";

export interface GeminiRoadmapResult {
  ok: true;
  data: AiRoadmapResponse;
}

export interface GeminiRoadmapFailure {
  ok: false;
  reason: GeminiRoadmapFailureReason;
  message: string;
}

function logGeminiRoadmapError(
  phase: GeminiRoadmapFailureReason,
  error: unknown,
  goalId: string,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const base = {
    phase,
    model: resolveModel(),
    goalId,
    geminiConfigured: isGeminiConfigured(),
  };

  if (error instanceof Error) {
    console.warn("[generate-roadmap:gemini:dev]", {
      ...base,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("[generate-roadmap:gemini:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
  });
}

export async function generateRoadmapWithGemini(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): Promise<GeminiRoadmapResult | GeminiRoadmapFailure> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing-api-key",
      message: "Gemini API key is not configured.",
    };
  }

  const milestoneCount = Math.min(Math.max(input.durationWeeks, 4), 8);
  const client = new GoogleGenAI({ apiKey });
  const timeoutMs = resolveTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.models.generateContent({
      model: resolveModel(),
      contents: buildUserPrompt(input, context),
      config: {
        systemInstruction: buildSystemPrompt(milestoneCount),
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });

    const content = response.text;

    if (!content) {
      const message = "Gemini returned empty roadmap content.";
      logGeminiRoadmapError("empty-response", new Error(message), input.goalId);
      return { ok: false, reason: "empty-response", message };
    }

    let raw: unknown;

    try {
      raw = JSON.parse(content);
    } catch (error) {
      logGeminiRoadmapError("invalid-json", error, input.goalId);
      return {
        ok: false,
        reason: "invalid-json",
        message: error instanceof Error ? error.message : "Invalid JSON from Gemini.",
      };
    }

    const validated = aiRoadmapResponseSchema.safeParse(raw);

    if (!validated.success) {
      const message = validated.error.issues[0]?.message ?? "Gemini roadmap failed Zod validation.";
      logGeminiRoadmapError("schema-validation", new Error(message), input.goalId);
      return { ok: false, reason: "schema-validation", message };
    }

    const structureError = validateAiRoadmapStructure(validated.data, input.durationWeeks, {
      goalSlug: input.goalSlug,
      goalCategory: input.goalCategory,
    });

    if (structureError) {
      logGeminiRoadmapError("structure-validation", new Error(structureError), input.goalId);
      return { ok: false, reason: "structure-validation", message: structureError };
    }

    return { ok: true, data: validated.data };
  } catch (error) {
    logGeminiRoadmapError("request-error", error, input.goalId);
    return {
      ok: false,
      reason: "request-error",
      message: error instanceof Error ? error.message : "Gemini roadmap request failed.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getRoadmapGeminiModel(): string {
  return resolveModel();
}

import "server-only";

import {
  classifyPipelineFailure,
  getGeminiModel,
  isGeminiConfigured,
  resolveTimeoutMs,
  runWithProviderFailover,
  type AiProviderName,
  type FailoverReason,
  type ProviderAttemptFailure,
} from "@/lib/ai/providers";
import {
  aiRoadmapResponseSchema,
  validateAiRoadmapStructure,
  type AiRoadmapResponse,
} from "@/lib/ai/roadmap-schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import {
  validateRoadmapAgainstKg,
  type NormalizedKgRoadmapTopic,
} from "@/knowledge-base/validation";
import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import { logKgPipelineDev } from "@/lib/knowledge-graph";

import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";

const DEFAULT_TIMEOUT_MS = 15_000;

function resolveRoadmapTimeoutMs(): number {
  return resolveTimeoutMs(
    "AI_ROADMAP_GENERATE_TIMEOUT_MS",
    DEFAULT_TIMEOUT_MS,
    "AI_INTENT_PARSE_TIMEOUT_MS",
  );
}

function resolveModel(): string {
  return getGeminiModel();
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

export interface RoadmapKgAcceptMeta {
  knowledgeGraphId: string;
  normalizedTopics: NormalizedKgRoadmapTopic[];
  confidence: number;
}

export interface FinalizedRoadmapPayload {
  response: AiRoadmapResponse;
  kg?: RoadmapKgAcceptMeta;
}

export interface GeminiRoadmapResult {
  ok: true;
  data: AiRoadmapResponse;
  provider: AiProviderName;
  model: string;
  failoverReason?: FailoverReason;
  kg?: RoadmapKgAcceptMeta;
  attempts?: ProviderAttemptFailure[];
}

export interface GeminiRoadmapFailure {
  ok: false;
  reason: GeminiRoadmapFailureReason;
  message: string;
  failoverReason?: FailoverReason;
  attempts?: ProviderAttemptFailure[];
}

function toLegacyRoadmapFailureReason(reason: FailoverReason): GeminiRoadmapFailureReason {
  switch (reason) {
    case "malformed_json":
      return "invalid-json";
    case "validation":
      return "schema-validation";
    case "structure_validation":
      return "structure-validation";
    case "missing_api_key":
      return "missing-api-key";
    case "timeout":
    case "quota":
    case "api_error":
    default:
      return "request-error";
  }
}

function logGeminiRoadmapError(
  phase: GeminiRoadmapFailureReason,
  error: unknown,
  goalId: string,
  extras?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const base = {
    phase,
    model: resolveModel(),
    goalId,
    geminiConfigured: isGeminiConfigured(),
    ...extras,
  };

  if (error instanceof Error) {
    console.warn("[generate-roadmap:provider:dev]", {
      ...base,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("[generate-roadmap:provider:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
  });
}

function finalizeRoadmapFromProviderText(
  content: string,
  provider: AiProviderName,
  input: OnboardingInput,
):
  | { ok: true; data: FinalizedRoadmapPayload }
  | { ok: false; reason: FailoverReason; message: string } {
  let raw: unknown;

  try {
    raw = JSON.parse(content);
  } catch (error) {
    logGeminiRoadmapError("invalid-json", error, input.goalId, { provider });
    return {
      ok: false,
      reason: classifyPipelineFailure("invalid-json"),
      message: error instanceof Error ? error.message : `Invalid JSON from ${provider}.`,
    };
  }

  const validated = aiRoadmapResponseSchema.safeParse(raw);

  if (!validated.success) {
    const message =
      validated.error.issues[0]?.message ?? `${provider} roadmap failed Zod validation.`;
    logGeminiRoadmapError("schema-validation", new Error(message), input.goalId, { provider });
    return {
      ok: false,
      reason: classifyPipelineFailure("schema-validation"),
      message,
    };
  }

  const structureError = validateAiRoadmapStructure(validated.data, input.durationWeeks, {
    goalSlug: input.goalSlug,
    goalCategory: input.goalCategory,
  });

  if (structureError) {
    logGeminiRoadmapError("structure-validation", new Error(structureError), input.goalId, {
      provider,
    });
    return {
      ok: false,
      reason: classifyPipelineFailure("structure-validation"),
      message: structureError,
    };
  }

  const resolved = resolveKnowledgeGraph(input.goalTitle, input.goalCategory, [
    input.goalSlug,
    input.goalId,
  ]);

  // AWS SAA keeps the existing seed/AI path — do not force KG topic remapping.
  if (isAwsCertificationGoal(input.goalSlug)) {
    return { ok: true, data: { response: validated.data } };
  }

  // High-confidence KG goals must pass KG validation (contamination, duplicates, prereq order).
  if (resolved.status === "resolved" && resolved.graph) {
    const kgValidation = validateRoadmapAgainstKg({
      goalTitle: input.goalTitle,
      goalCategory: input.goalCategory,
      aliases: [input.goalSlug, input.goalId, resolved.graph.id],
      topics: validated.data.milestones.map((milestone, index) => ({
        title: milestone.topicTitle,
        order: index + 1,
      })),
      graph: resolved.graph,
    });

    logKgPipelineDev({
      flow: "roadmap",
      providersTried: [provider],
      providerAccepted: kgValidation.ok ? provider : null,
      knowledgeGraphId: kgValidation.knowledgeGraphId,
      kgConfidence: resolved.confidence,
      canonicalTopics: kgValidation.normalizedTopics.map((topic) => topic.canonicalTopicId),
      reasons: kgValidation.reasons,
      goalId: input.goalId,
    });

    if (!kgValidation.ok) {
      const message =
        kgValidation.reasons[0] ?? `${provider} roadmap failed Knowledge Graph validation.`;
      logGeminiRoadmapError("structure-validation", new Error(message), input.goalId, {
        provider,
        kgReasons: kgValidation.reasons,
      });
      return {
        ok: false,
        reason: classifyPipelineFailure("structure-validation"),
        message,
      };
    }

    const remapped: AiRoadmapResponse = {
      milestones: validated.data.milestones.map((milestone, index) => {
        const normalized = kgValidation.normalizedTopics[index];
        return {
          ...milestone,
          topicTitle: normalized?.canonicalTitle ?? milestone.topicTitle,
        };
      }),
    };

    return {
      ok: true,
      data: {
        response: remapped,
        kg: {
          knowledgeGraphId: kgValidation.knowledgeGraphId!,
          normalizedTopics: kgValidation.normalizedTopics,
          confidence: resolved.confidence,
        },
      },
    };
  }

  // Non-KG / unsupported goals: accept AI-only after Zod + structure (no random KG mapping).
  return { ok: true, data: { response: validated.data } };
}

export async function generateRoadmapWithGemini(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): Promise<GeminiRoadmapResult | GeminiRoadmapFailure> {
  const milestoneCount = Math.min(Math.max(input.durationWeeks, 4), 8);
  const timeoutMs = resolveRoadmapTimeoutMs();

  const outcome = await runWithProviderFailover({
    request: {
      systemInstruction: buildSystemPrompt(milestoneCount),
      userContent: buildUserPrompt(input, context),
      timeoutMs,
      context: {
        flow: "roadmap",
        goalId: input.goalId,
      },
    },
    finalize: (text, provider) => finalizeRoadmapFromProviderText(text, provider, input),
  });

  if (outcome.ok) {
    return {
      ok: true,
      data: outcome.data.response,
      provider: outcome.provider,
      model: outcome.model,
      failoverReason: outcome.failoverFrom?.reason,
      kg: outcome.data.kg,
      attempts: outcome.failoverFrom ? [outcome.failoverFrom] : undefined,
    };
  }

  const legacyReason = toLegacyRoadmapFailureReason(outcome.reason);
  logGeminiRoadmapError(legacyReason, new Error(outcome.message), input.goalId, {
    failoverReason: outcome.reason,
    attempts: outcome.attempts,
  });

  return {
    ok: false,
    reason: legacyReason,
    message: outcome.message,
    failoverReason: outcome.reason,
    attempts: outcome.attempts,
  };
}

export function getRoadmapGeminiModel(): string {
  return resolveModel();
}

import "server-only";

import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import { logGeminiLessonGenerated } from "@/lib/dev/architecture-log";
import {
  displaySourceFromOriginal,
  getServerLessonFallbackPath,
  reportLessonSource,
  resetServerLessonFallbackPath,
  type LessonOriginalSource,
} from "@/lib/dev/lesson-source-observability";
import {
  generateLessonWithGemini,
  getLessonGeminiModel,
  type GenerateLessonInput,
} from "@/lib/ai/generate-lesson";
import { resolveDeterministicLesson, type LessonFallbackContext } from "@/lib/ai/lesson-fallback";
import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import {
  isAnyAiProviderConfigured,
  logAiProviderSuccess,
  type AiProviderName,
} from "@/lib/ai/providers";
import { ensureKgLessonPassesLiveGates, logKgPipelineDev } from "@/lib/knowledge-graph";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";

export type { GenerateLessonInput };

export interface GenerateLessonResult {
  lesson: GeneratedLesson;
  source: GeneratedLesson["source"];
  fallbackReason?: string;
  /** Development-only provenance for client observability. */
  generationPath?: LessonOriginalSource;
}

function providerToOriginalSource(provider: AiProviderName): LessonOriginalSource {
  return provider === "grok" ? "grok" : "gemini";
}

function logLessonGenerationDevVerification(payload: {
  goalId: string;
  topicId: string;
  source: GeneratedLesson["source"];
  provider?: AiProviderName | "deterministic" | "kg";
  model?: string;
  durationMs: number;
  sectionCount: number;
  fallbackReason?: string;
}): void {
  if (payload.source === "ai" && payload.provider && payload.provider !== "deterministic" && payload.provider !== "kg") {
    logAiProviderSuccess({
      flow: "lesson",
      provider: payload.provider,
      model: payload.model,
      goalId: payload.goalId,
      topicId: payload.topicId,
    });

    if (payload.provider === "gemini") {
      logGeminiLessonGenerated({
        goalId: payload.goalId,
        topicId: payload.topicId,
        model: payload.model,
        durationMs: payload.durationMs,
        sectionCount: payload.sectionCount,
      });
    }
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  logAiProviderSuccess({
    flow: "lesson",
    provider: "deterministic",
    goalId: payload.goalId,
    topicId: payload.topicId,
  });

  console.info("[Fallback] Lesson generated", payload);
}

function reportServerLessonSource(
  input: GenerateLessonInput,
  originalSource: LessonOriginalSource,
  durationMs: number,
  reason?: string,
): void {
  reportLessonSource({
    goalTitle: input.goalTitle,
    topicTitle: input.topicTitle,
    goalId: input.goalId,
    topicId: input.topicId,
    displaySource: displaySourceFromOriginal(originalSource),
    originalSource,
    cache: "MISS",
    reason,
    generationTimeMs: durationMs,
  });
}

function tryKgLessonFallback(
  input: GenerateLessonInput,
  reason: string,
  lockedGraphId?: string | null,
): GenerateLessonResult | null {
  const ensured = ensureKgLessonPassesLiveGates({
    topicId: input.topicId,
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    goalSlug: input.goalSlug,
    topicTitle: input.topicTitle,
    knowledgeGraphId: lockedGraphId ?? undefined,
    aliases: [input.goalSlug, input.goalId, lockedGraphId ?? ""].filter(Boolean),
  });

  if (!ensured.ok) {
    logKgPipelineDev({
      flow: "lesson",
      providersTried: ["gemini", "grok"],
      providerAccepted: null,
      finalSource: null,
      reasons: [ensured.reason, reason],
      goalId: input.goalId,
      topicId: input.topicId,
    });
    return null;
  }

  const lesson: GeneratedLesson = {
    ...ensured.lesson,
    topicId: input.topicId,
    source: "deterministic",
    knowledgeGraphId: ensured.knowledgeGraphId,
    canonicalTopicId: ensured.canonicalTopicId,
    kgValidationVersion: ensured.kgValidationVersion,
  };

  logKgPipelineDev({
    flow: "lesson",
    providersTried: ["gemini", "grok"],
    providerAccepted: null,
    finalSource: "kg",
    knowledgeGraphId: ensured.knowledgeGraphId,
    canonicalTopicId: ensured.canonicalTopicId,
    conceptsCovered: ensured.coveredConceptIds,
    goalId: input.goalId,
    topicId: input.topicId,
  });

  return {
    lesson,
    source: "deterministic",
    fallbackReason: reason,
    generationPath: "kg",
  };
}

export async function generateLessonForLearner(
  input: GenerateLessonInput,
): Promise<GenerateLessonResult> {
  const startedAt = Date.now();
  const fallbackContext: LessonFallbackContext = {
    goalId: input.goalId,
    goalSlug: input.goalSlug,
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    skillLevel: input.skillLevel,
    learningObjectives: input.learningObjectives,
    durationMinutes: input.durationMinutes,
  };
  const resolved = resolveKnowledgeGraph(input.goalTitle, input.goalCategory, [
    input.goalSlug,
    input.goalId,
  ]);
  const kgResolved = resolved.status === "resolved" && Boolean(resolved.graph);

  if (isAnyAiProviderConfigured()) {
    const aiResult = await generateLessonWithGemini(input);

    if (aiResult.ok) {
      const lesson: GeneratedLesson = {
        ...aiResult.data,
        topicId: input.topicId,
        source: "ai",
        knowledgeGraphId: aiResult.kg?.knowledgeGraphId,
        canonicalTopicId: aiResult.kg?.canonicalTopicId,
        kgValidationVersion: aiResult.kg ? KG_VALIDATION_VERSION : undefined,
      };
      const durationMs = Date.now() - startedAt;
      const originalSource = providerToOriginalSource(aiResult.provider);

      logLessonGenerationDevVerification({
        goalId: input.goalId,
        topicId: input.topicId,
        source: "ai",
        provider: aiResult.provider,
        model: aiResult.model,
        durationMs,
        sectionCount: lesson.sections.length,
      });

      logKgPipelineDev({
        flow: "lesson",
        providersTried: [aiResult.provider],
        providerAccepted: aiResult.provider,
        finalSource: aiResult.provider,
        knowledgeGraphId: aiResult.kg?.knowledgeGraphId ?? null,
        canonicalTopicId: aiResult.kg?.canonicalTopicId ?? null,
        conceptsCovered: aiResult.kg?.coveredConceptIds,
        goalId: input.goalId,
        topicId: input.topicId,
      });

      reportServerLessonSource(
        input,
        originalSource,
        durationMs,
        aiResult.failoverReason,
      );

      return { lesson, source: "ai", generationPath: originalSource };
    }

    if (kgResolved) {
      const kgFallback = tryKgLessonFallback(input, aiResult.reason, resolved.graph?.id);
      if (kgFallback) {
        const durationMs = Date.now() - startedAt;
        logLessonGenerationDevVerification({
          goalId: input.goalId,
          topicId: input.topicId,
          source: "deterministic",
          provider: "kg",
          model: getLessonGeminiModel(),
          durationMs,
          sectionCount: kgFallback.lesson.sections.length,
          fallbackReason: aiResult.reason,
        });
        reportServerLessonSource(input, "kg", durationMs, aiResult.reason);
        return kgFallback;
      }
    }

    resetServerLessonFallbackPath();
    const lesson = resolveDeterministicLesson(fallbackContext);
    const generationPath = getServerLessonFallbackPath();
    const durationMs = Date.now() - startedAt;

    logLessonGenerationDevVerification({
      goalId: input.goalId,
      topicId: input.topicId,
      source: "deterministic",
      provider: "deterministic",
      model: getLessonGeminiModel(),
      durationMs,
      sectionCount: lesson.sections.length,
      fallbackReason: aiResult.reason,
    });

    reportServerLessonSource(input, generationPath, durationMs, aiResult.reason);

    return {
      lesson,
      source: "deterministic",
      fallbackReason: aiResult.reason,
      generationPath,
    };
  }

  if (kgResolved) {
    const kgFallback = tryKgLessonFallback(input, "missing-api-key", resolved.graph?.id);
    if (kgFallback) {
      const durationMs = Date.now() - startedAt;
      logLessonGenerationDevVerification({
        goalId: input.goalId,
        topicId: input.topicId,
        source: "deterministic",
        provider: "kg",
        durationMs,
        sectionCount: kgFallback.lesson.sections.length,
        fallbackReason: "missing-api-key",
      });
      reportServerLessonSource(input, "kg", durationMs, "missing-api-key");
      return kgFallback;
    }
  }

  resetServerLessonFallbackPath();
  const lesson = resolveDeterministicLesson(fallbackContext);
  const generationPath = getServerLessonFallbackPath();
  const durationMs = Date.now() - startedAt;

  logLessonGenerationDevVerification({
    goalId: input.goalId,
    topicId: input.topicId,
    source: "deterministic",
    provider: "deterministic",
    durationMs,
    sectionCount: lesson.sections.length,
    fallbackReason: "missing-api-key",
  });

  reportServerLessonSource(input, generationPath, durationMs, "missing-api-key");

  return {
    lesson,
    source: "deterministic",
    fallbackReason: "missing-api-key",
    generationPath,
  };
}

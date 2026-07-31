import "server-only";

import { logGeminiLessonGenerated } from "@/lib/dev/architecture-log";
import {
  displaySourceFromOriginal,
  getServerLessonFallbackPath,
  reportLessonSource,
  resetServerLessonFallbackPath,
  type LessonOriginalSource,
} from "@/lib/dev/lesson-source-observability";
import { generateLessonWithGemini, getLessonGeminiModel, type GenerateLessonInput } from "@/lib/ai/generate-lesson";
import { resolveDeterministicLesson, type LessonFallbackContext } from "@/lib/ai/lesson-fallback";
import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

export type { GenerateLessonInput };

export interface GenerateLessonResult {
  lesson: GeneratedLesson;
  source: GeneratedLesson["source"];
  fallbackReason?: string;
  /** Development-only provenance for client observability. */
  generationPath?: LessonOriginalSource;
}

function logLessonGenerationDevVerification(payload: {
  goalId: string;
  topicId: string;
  source: GeneratedLesson["source"];
  model?: string;
  durationMs: number;
  sectionCount: number;
  fallbackReason?: string;
}): void {
  if (payload.source === "ai") {
    logGeminiLessonGenerated({
      goalId: payload.goalId,
      topicId: payload.topicId,
      model: payload.model,
      durationMs: payload.durationMs,
      sectionCount: payload.sectionCount,
    });
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    return;
  }

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

  if (isGeminiConfigured()) {
    const geminiResult = await generateLessonWithGemini(input);

    if (geminiResult.ok) {
      const lesson: GeneratedLesson = {
        ...geminiResult.data,
        topicId: input.topicId,
        source: "ai",
      };
      const durationMs = Date.now() - startedAt;

      logLessonGenerationDevVerification({
        goalId: input.goalId,
        topicId: input.topicId,
        source: "ai",
        model: getLessonGeminiModel(),
        durationMs,
        sectionCount: lesson.sections.length,
      });

      reportServerLessonSource(input, "ai", durationMs);

      return { lesson, source: "ai", generationPath: "ai" };
    }

    resetServerLessonFallbackPath();
    const lesson = resolveDeterministicLesson(fallbackContext);
    const generationPath = getServerLessonFallbackPath();
    const durationMs = Date.now() - startedAt;

    logLessonGenerationDevVerification({
      goalId: input.goalId,
      topicId: input.topicId,
      source: "deterministic",
      model: getLessonGeminiModel(),
      durationMs,
      sectionCount: lesson.sections.length,
      fallbackReason: geminiResult.reason,
    });

    reportServerLessonSource(input, generationPath, durationMs, geminiResult.reason);

    return {
      lesson,
      source: "deterministic",
      fallbackReason: geminiResult.reason,
      generationPath,
    };
  }

  resetServerLessonFallbackPath();
  const lesson = resolveDeterministicLesson(fallbackContext);
  const generationPath = getServerLessonFallbackPath();
  const durationMs = Date.now() - startedAt;

  logLessonGenerationDevVerification({
    goalId: input.goalId,
    topicId: input.topicId,
    source: "deterministic",
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

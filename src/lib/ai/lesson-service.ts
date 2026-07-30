import "server-only";

import { logGeminiLessonGenerated } from "@/lib/dev/architecture-log";
import { generateLessonWithGemini, getLessonGeminiModel, type GenerateLessonInput } from "@/lib/ai/generate-lesson";
import { resolveDeterministicLesson, type LessonFallbackContext } from "@/lib/ai/lesson-fallback";
import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

export type { GenerateLessonInput };

export interface GenerateLessonResult {
  lesson: GeneratedLesson;
  source: GeneratedLesson["source"];
  fallbackReason?: string;
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

      logLessonGenerationDevVerification({
        goalId: input.goalId,
        topicId: input.topicId,
        source: "ai",
        model: getLessonGeminiModel(),
        durationMs: Date.now() - startedAt,
        sectionCount: lesson.sections.length,
      });

      return { lesson, source: "ai" };
    }

    const lesson = resolveDeterministicLesson(fallbackContext);

    logLessonGenerationDevVerification({
      goalId: input.goalId,
      topicId: input.topicId,
      source: "deterministic",
      model: getLessonGeminiModel(),
      durationMs: Date.now() - startedAt,
      sectionCount: lesson.sections.length,
      fallbackReason: geminiResult.reason,
    });

    return {
      lesson,
      source: "deterministic",
      fallbackReason: geminiResult.reason,
    };
  }

  const lesson = resolveDeterministicLesson(fallbackContext);

  logLessonGenerationDevVerification({
    goalId: input.goalId,
    topicId: input.topicId,
    source: "deterministic",
    durationMs: Date.now() - startedAt,
    sectionCount: lesson.sections.length,
    fallbackReason: "missing-api-key",
  });

  return {
    lesson,
    source: "deterministic",
    fallbackReason: "missing-api-key",
  };
}

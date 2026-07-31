import { createDeterministicLessonForLearner, type LessonFallbackContext } from "@/lib/ai/lesson-fallback";
import { logApiFallbackTransparency } from "@/lib/dev/architecture-log";
import {
  displaySourceFromOriginal,
  reportLessonSource,
  type LessonOriginalSource,
} from "@/lib/dev/lesson-source-observability";
import { enrichLessonWithPracticalBlocks, lessonHasPracticalBlocks } from "@/lib/learn/enrich-lesson-practical";
import { recordLessonFetchTiming } from "@/lib/learn/lesson-fetch-timing";
import {
  generateLessonResponseSchema,
  type GenerateLessonRequest,
} from "@/lib/learn/generate-lesson-request-schema";
import { readCachedLesson, writeCachedLesson } from "@/lib/learn/lesson-session-cache";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";

const inFlightLessons = new Map<string, Promise<GeneratedLessonPayload>>();

function lessonRequestKey(goalId: string, topicId: string): string {
  return `${goalId}:${topicId}`;
}

function cacheAndReturn(
  goalId: string,
  payload: GeneratedLessonPayload,
  originalSource?: LessonOriginalSource,
): GeneratedLessonPayload {
  writeCachedLesson(goalId, payload, originalSource);
  return payload;
}

function toFallbackContext(request: GenerateLessonRequest): LessonFallbackContext {
  return {
    goalId: request.goalId,
    goalSlug: request.goalSlug,
    goalTitle: request.goalTitle,
    goalCategory: request.goalCategory,
    topicId: request.topicId,
    topicTitle: request.topicTitle,
    skillLevel: request.skillLevel,
    learningObjectives: request.learningObjectives,
    durationMinutes: request.durationMinutes,
  };
}

function normalizeLessonPayload(
  request: GenerateLessonRequest,
  payload: GeneratedLessonPayload,
): GeneratedLessonPayload {
  if (lessonHasPracticalBlocks(payload)) {
    return payload;
  }

  const enriched = enrichLessonWithPracticalBlocks(payload, toFallbackContext(request));

  return {
    ...enriched,
    topicId: request.topicId,
    source: payload.source,
  };
}

function buildFallbackPayload(
  request: GenerateLessonRequest,
  reason: string,
): GeneratedLessonPayload {
  const startedAt = Date.now();
  const fallback = createDeterministicLessonForLearner(
    {
      goalId: request.goalId,
      goalSlug: request.goalSlug,
      goalTitle: request.goalTitle,
      goalCategory: request.goalCategory,
      topicId: request.topicId,
      topicTitle: request.topicTitle,
      skillLevel: request.skillLevel,
      learningObjectives: request.learningObjectives,
      durationMinutes: request.durationMinutes,
    },
    reason,
  );

  const payload: GeneratedLessonPayload = {
    ...fallback.lesson,
    topicId: request.topicId,
    source: fallback.source,
  };

  logApiFallbackTransparency("generate-lesson", {
    source: fallback.source,
    fallbackReason: fallback.fallbackReason,
    goalId: request.goalId,
    topicId: request.topicId,
  });

  reportLessonSource({
    goalTitle: request.goalTitle,
    topicTitle: request.topicTitle,
    goalId: request.goalId,
    topicId: request.topicId,
    displaySource: "Deterministic Fallback",
    originalSource: "deterministic",
    cache: "MISS",
    reason: `Client fallback: ${reason}`,
    generationTimeMs: Date.now() - startedAt,
  });

  return cacheAndReturn(
    request.goalId,
    normalizeLessonPayload(request, payload),
    "deterministic",
  );
}

async function fetchGeneratedLessonInternal(
  request: GenerateLessonRequest,
): Promise<GeneratedLessonPayload> {
  recordLessonFetchTiming("cache-lookup-start", {
    topicId: request.topicId,
    goalId: request.goalId,
  });

  const cached = readCachedLesson(request.goalId, request.topicId);

  if (cached) {
    recordLessonFetchTiming("cache-hit", {
      topicId: request.topicId,
      goalId: request.goalId,
    });
    return normalizeLessonPayload(request, cached);
  }

  try {
    recordLessonFetchTiming("api-request-start", {
      topicId: request.topicId,
      goalId: request.goalId,
    });

    const response = await fetch("/api/learn/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    recordLessonFetchTiming("api-request-end", {
      topicId: request.topicId,
      goalId: request.goalId,
      detail: `status ${response.status}`,
    });

    if (!response.ok) {
      return buildFallbackPayload(request, "network");
    }

    const body: unknown = await response.json();
    const validated = generateLessonResponseSchema.safeParse(body);

    recordLessonFetchTiming("validation-complete", {
      topicId: request.topicId,
      goalId: request.goalId,
      detail: validated.success ? "ok" : "invalid",
    });

    if (!validated.success) {
      return buildFallbackPayload(request, "invalid-response");
    }

    logApiFallbackTransparency("generate-lesson", {
      source: validated.data.source,
      fallbackReason: validated.data.fallbackReason,
      goalId: request.goalId,
      topicId: request.topicId,
    });

    const generationPath: LessonOriginalSource =
      validated.data.generationPath ??
      (validated.data.source === "ai" ? "ai" : "deterministic");

    reportLessonSource({
      goalTitle: request.goalTitle,
      topicTitle: request.topicTitle,
      goalId: request.goalId,
      topicId: request.topicId,
      displaySource: displaySourceFromOriginal(generationPath),
      originalSource: generationPath,
      cache: "MISS",
      reason: validated.data.fallbackReason,
    });

    const payload: GeneratedLessonPayload = {
      ...validated.data.lesson,
      topicId: request.topicId,
      source: validated.data.source,
    };

    return cacheAndReturn(
      request.goalId,
      normalizeLessonPayload(request, payload),
      generationPath,
    );
  } catch {
    return buildFallbackPayload(request, "network");
  }
}

export async function fetchGeneratedLesson(
  request: GenerateLessonRequest,
): Promise<GeneratedLessonPayload> {
  const cached = readCachedLesson(request.goalId, request.topicId);

  if (cached) {
    recordLessonFetchTiming("cache-hit", {
      topicId: request.topicId,
      goalId: request.goalId,
      detail: "in-flight bypass",
    });
    return normalizeLessonPayload(request, cached);
  }

  const key = lessonRequestKey(request.goalId, request.topicId);
  const inFlight = inFlightLessons.get(key);

  if (inFlight) {
    return inFlight;
  }

  const promise = fetchGeneratedLessonInternal(request).finally(() => {
    inFlightLessons.delete(key);
  });

  inFlightLessons.set(key, promise);
  return promise;
}

/** Test helper ΓÇö clears in-flight deduplication state. */
export function resetLessonFetchDedupForTests(): void {
  inFlightLessons.clear();
}

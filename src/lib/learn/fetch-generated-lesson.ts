import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import { logApiFallbackTransparency } from "@/lib/dev/architecture-log";
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
): GeneratedLessonPayload {
  writeCachedLesson(goalId, payload);
  return payload;
}

function buildFallbackPayload(
  request: GenerateLessonRequest,
  reason: string,
): GeneratedLessonPayload {
  const fallback = createDeterministicLessonForLearner(
    {
      goalId: request.goalId,
      topicId: request.topicId,
      topicTitle: request.topicTitle,
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

  return cacheAndReturn(request.goalId, payload);
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
    return cached;
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

    const payload: GeneratedLessonPayload = {
      ...validated.data.lesson,
      topicId: request.topicId,
      source: validated.data.source,
    };

    return cacheAndReturn(request.goalId, payload);
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
    return cached;
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

/** Test helper — clears in-flight deduplication state. */
export function resetLessonFetchDedupForTests(): void {
  inFlightLessons.clear();
}

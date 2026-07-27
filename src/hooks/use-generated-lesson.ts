"use client";

import { useEffect, useState } from "react";

import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import { fetchGeneratedLesson } from "@/lib/learn/fetch-generated-lesson";
import { recordLessonFetchTiming } from "@/lib/learn/lesson-fetch-timing";
import { readCachedLesson } from "@/lib/learn/lesson-session-cache";
import { buildGenerateLessonRequest } from "@/lib/learn/resolve-lesson-context";
import { useAppStore } from "@/stores/use-app-store";

function readInitialLesson(goalId: string | undefined, topicId: string) {
  if (!goalId) {
    return { lesson: null, loading: true };
  }

  const cached = readCachedLesson(goalId, topicId);
  return { lesson: cached, loading: !cached };
}

export function useGeneratedLesson(topicId: string) {
  const isHydrated = useAppStore((store) => store.isHydrated);
  const isInitialized = useAppStore((store) => store.isInitialized);
  const goalId = useAppStore((store) => store.roadmap?.goalId);
  const twinId = useAppStore((store) => store.twin?.id);
  const initial = readInitialLesson(goalId, topicId);
  const [lesson, setLesson] = useState<GeneratedLessonPayload | null>(initial.lesson);
  const [loading, setLoading] = useState(initial.loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !isInitialized || !goalId) {
      return;
    }

    const resolvedGoalId = goalId;
    let cancelled = false;

    recordLessonFetchTiming("lesson-hook-resubscribed", { topicId, goalId: resolvedGoalId });

    async function loadLesson() {
      setLoading(true);
      setError(null);

      try {
        const cached = readCachedLesson(resolvedGoalId, topicId);

        if (cached) {
          if (!cancelled) {
            setLesson(cached);
            recordLessonFetchTiming("lesson-render-ready", {
              topicId: cached.topicId,
              goalId: resolvedGoalId,
              detail: "cache hit",
            });
          }
          return;
        }

        const request = buildGenerateLessonRequest(useAppStore.getState(), topicId);

        if (!request) {
          throw new Error("Unable to resolve lesson context.");
        }

        const generated = await fetchGeneratedLesson(request);

        if (!cancelled) {
          setLesson(generated);
          recordLessonFetchTiming("lesson-render-ready", {
            topicId: generated.topicId,
            goalId: request.goalId,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to prepare this lesson.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          recordLessonFetchTiming("lesson-loading-complete", {
            topicId,
            goalId: resolvedGoalId,
          });
        } else {
          recordLessonFetchTiming("lesson-hook-cancelled", { topicId, goalId: resolvedGoalId });
        }
      }
    }

    void loadLesson();

    return () => {
      cancelled = true;
    };
  }, [goalId, isHydrated, isInitialized, topicId, twinId]);

  return { lesson, loading, error, isHydrated, isInitialized };
}

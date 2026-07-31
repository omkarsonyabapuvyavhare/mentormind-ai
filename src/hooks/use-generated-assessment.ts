"use client";

import { useEffect, useState } from "react";

import { logAssessmentBuiltFromLesson } from "@/lib/dev/architecture-log";
import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import {
  readCachedAssessment,
  writeCachedAssessment,
} from "@/lib/assessment/assessment-session-cache";
import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import { fetchGeneratedLesson } from "@/lib/learn/fetch-generated-lesson";
import { readCachedLesson } from "@/lib/learn/lesson-session-cache";
import { buildGenerateLessonRequest, resolveTopicTitle } from "@/lib/learn/resolve-lesson-context";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { useAppStore } from "@/stores/use-app-store";

export function useGeneratedAssessment(topicId: string) {
  const isHydrated = useAppStore((store) => store.isHydrated);
  const isInitialized = useAppStore((store) => store.isInitialized);
  const goalId = useAppStore((store) => store.roadmap?.goalId);
  const twinId = useAppStore((store) => store.twin?.id);
  const [assessment, setAssessment] = useState<TopicAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !isInitialized || !goalId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      const cachedAssessment = readCachedAssessment(goalId, topicId);

      if (cachedAssessment) {
        if (!cancelled) {
          setAssessment(cachedAssessment);
          setLoading(false);
        }
        return;
      }

      const state = useAppStore.getState();
      let lesson = readCachedLesson(goalId, topicId);

      if (!lesson) {
        const request = buildGenerateLessonRequest(state, topicId);

        if (!request) {
          if (!cancelled) {
            setError("Unable to resolve assessment context.");
            setLoading(false);
          }
          return;
        }

        lesson = await fetchGeneratedLesson(request);
      }

      let built: TopicAssessment;

      try {
        built = buildAssessmentFromLesson(lesson, {
          goalSlug: goalId,
          goalCategory: state.twin?.goal.category ?? "General Technology",
        });
      } catch {
        built = buildDeterministicTopicAssessment({
          topicId,
          topicTitle: resolveTopicTitle(state, topicId),
          goalSlug: goalId,
          goalCategory: state.twin?.goal.category ?? "General Technology",
          learningObjectives: lesson.learningObjectives,
          sections: lesson.sections.map((section) => ({
            heading: section.heading,
            summary: section.summary,
            content: section.content,
            commonMistakes: section.commonMistakes,
            practicalExample: section.practicalExample,
          })),
          practicalArtifact: lesson.practicalArtifact,
          handsOnExercise: lesson.handsOnExercise,
        });
      }

      writeCachedAssessment(goalId, built);

      logAssessmentBuiltFromLesson({
        goalId,
        topicId,
        questionCount: built.questions.length,
        assessmentSource: built.source,
        lessonSource: lesson.source,
      });

      if (!cancelled) {
        setAssessment(built);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [goalId, isHydrated, isInitialized, topicId, twinId]);

  return { assessment, loading, error, isHydrated, isInitialized };
}

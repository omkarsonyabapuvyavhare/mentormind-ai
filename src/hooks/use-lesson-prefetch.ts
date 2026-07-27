"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { prefetchCurrentLesson } from "@/lib/learn/prefetch-current-lesson";
import { selectTodayMission } from "@/lib/tutor/mission";
import { selectNextTask } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

/** Background lesson + route prefetch for the dashboard's current mission. */
export function useLessonPrefetch() {
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const goalId = useAppStore((state) => state.roadmap?.goalId);
  const topicId = useAppStore((state) => selectNextTask(state)?.topicId);
  const prefetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !isInitialized || !goalId || !topicId) {
      return;
    }

    const key = `${goalId}:${topicId}`;

    if (prefetchedRef.current === key) {
      return;
    }

    prefetchedRef.current = key;

    const state = useAppStore.getState();
    const mission = selectTodayMission(state);

    router.prefetch(mission.lessonHref);
    prefetchCurrentLesson(state);
  }, [goalId, isHydrated, isInitialized, router, topicId]);
}

"use client";

import { useMemo } from "react";

import {
  computeRoadmapCompletion,
  selectMilestoneCompletion,
  type RoadmapCompletion,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";
import type { LearningTask } from "@/types/roadmap";

/** Stable React subscription — derives completion from roadmap.tasks only. */
export function useRoadmapCompletion(): RoadmapCompletion {
  const tasks = useAppStore((state) => state.roadmap?.tasks);
  return useMemo(() => computeRoadmapCompletion(tasks ?? []), [tasks]);
}

export function useMilestoneCompletion(tasks: LearningTask[]): RoadmapCompletion {
  return useMemo(() => selectMilestoneCompletion(tasks), [tasks]);
}

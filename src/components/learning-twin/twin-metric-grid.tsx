"use client";

import { StatCard } from "@/components/shared/stat-card";
import {
  selectCurrentStreak,
  selectDropoutRisk,
  selectDropoutRiskLevel,
  selectRoadmapCompletion,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function TwinMetricGrid() {
  const state = useAppStore();
  const twin = state.twin;

  if (!twin) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Consistency" value={`${twin.consistencyScore}%`} />
      <StatCard label="Current streak" value={`${selectCurrentStreak(state)} days`} />
      <StatCard
        label="Dropout risk"
        value={`${selectDropoutRisk(state)} (${selectDropoutRiskLevel(state)})`}
      />
      <StatCard label="Learning velocity" value={twin.learningVelocity.toFixed(1)} />
      <StatCard label="Roadmap completion" value={`${selectRoadmapCompletion(state)}%`} />
      <StatCard label="Inactivity" value={`${twin.inactivityDays} days`} />
      <StatCard
        label="Study logged"
        value={`${Math.round(twin.totalStudyMinutes / 60)}h / ${Math.round(twin.plannedStudyMinutes / 60)}h`}
      />
      <StatCard label="Quiz attempts" value={`${twin.quizHistory.length}`} />
    </div>
  );
}

"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { formatStudyHours } from "@/lib/utils";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function GoalProgressCard() {
  const metrics = selectDashboardMetrics(useAppStore());
  const { spentMinutes, plannedMinutes } = metrics.timeSpentVsPlanned;
  const timePercent =
    plannedMinutes === 0 ? 0 : Math.round((spentMinutes / plannedMinutes) * 100);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Time tracking</h3>
      <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
        <ProgressRing value={metrics.completion} label="Overall completion" />
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Time spent</span>
            <span className="font-medium">
              {formatStudyHours(spentMinutes)} / {formatStudyHours(plannedMinutes)}
            </span>
          </div>
          <ProgressBar value={timePercent} className="mt-3" />
          <p className="mt-3 text-sm text-muted">
            {timePercent}% of planned study time logged toward your AWS certification goal.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

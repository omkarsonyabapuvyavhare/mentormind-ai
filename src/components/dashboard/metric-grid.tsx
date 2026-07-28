"use client";

import { StatCard } from "@/components/shared/stat-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { GlassCard } from "@/components/ui/glass-card";
import { useRoadmapCompletion } from "@/hooks/use-roadmap-completion";
import {
  selectCurrentStreak,
  selectDropoutRisk,
  selectDropoutRiskLevel,
  selectNextTask,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function MetricGrid() {
  const completion = useRoadmapCompletion();
  const streak = useAppStore(selectCurrentStreak);
  const nextTask = useAppStore(selectNextTask);
  const dropoutRisk = useAppStore(selectDropoutRisk);
  const dropoutRiskLevel = useAppStore(selectDropoutRiskLevel);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Primary metrics">
      <StatCard
        label="Overall completion"
        value={`${completion.percentage}%`}
        accent="cyan"
        emphasized
      />
      <StatCard
        label="Learning streak"
        value={`${streak} days`}
        hint="Consecutive active study days"
        accent="emerald"
        emphasized
      />
      <StatCard
        label="Next task"
        value={nextTask?.title ?? "No pending tasks"}
        accent="blue"
      />
      <GlassCard>
        <p className="text-sm text-muted">Dropout risk</p>
        <div className="mt-3">
          <RiskBadge level={dropoutRiskLevel} score={dropoutRisk} />
        </div>
        <p className="mt-2 text-sm text-muted">
          Risk signal from consistency, inactivity, and quiz performance
        </p>
      </GlassCard>
    </section>
  );
}

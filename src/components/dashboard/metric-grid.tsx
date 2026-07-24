"use client";

import { StatCard } from "@/components/shared/stat-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { GlassCard } from "@/components/ui/glass-card";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function MetricGrid() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Primary metrics">
      <StatCard
        label="Overall completion"
        value={`${metrics.completion}%`}
        accent="cyan"
        emphasized
      />
      <StatCard
        label="Learning streak"
        value={`${metrics.streak} days`}
        hint="Consecutive active study days"
        accent="emerald"
        emphasized
      />
      <StatCard
        label="Next task"
        value={metrics.nextTask?.title ?? "No pending tasks"}
        accent="blue"
      />
      <GlassCard>
        <p className="text-sm text-muted">Dropout risk</p>
        <div className="mt-3">
          <RiskBadge level={metrics.dropoutRiskLevel} score={metrics.dropoutRisk} />
        </div>
        <p className="mt-2 text-sm text-muted">
          Risk signal from consistency, inactivity, and quiz performance
        </p>
      </GlassCard>
    </section>
  );
}

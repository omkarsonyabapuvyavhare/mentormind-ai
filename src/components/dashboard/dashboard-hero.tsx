"use client";

import Link from "next/link";
import { format } from "date-fns";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardHero() {
  const state = useAppStore();
  const metrics = selectDashboardMetrics(state);

  if (!state.twin || !state.roadmap) {
    return null;
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            {state.twin.goal.examCode}
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
            {state.twin.goal.title}
          </h2>
          <p className="mt-3 text-sm text-muted md:text-base">
            Target date {format(new Date(state.twin.goal.targetDate), "PPP")} · Roadmap version{" "}
            {metrics.roadmapVersion}
          </p>
        </div>
        <div className="text-sm text-muted">
          Adaptive learning twin active ·{" "}
          <Link href="/assessment/vpc-networking" className="text-cyan-300 underline-offset-4 hover:underline">
            Start VPC assessment
          </Link>
          {" · "}
          <Link href="/demo" className="text-cyan-300 underline-offset-4 hover:underline">
            Open demo controls
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

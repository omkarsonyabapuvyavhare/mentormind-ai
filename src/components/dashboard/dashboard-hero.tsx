"use client";

import Link from "next/link";
import { format } from "date-fns";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { selectTodayMission } from "@/lib/tutor/mission";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardHero() {
  const state = useAppStore();
  const metrics = selectDashboardMetrics(state);
  const mission = selectTodayMission(state);

  if (!state.twin || !state.roadmap) {
    return null;
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {state.twin.goal.examCode ? (
            <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              {state.twin.goal.examCode}
            </Badge>
          ) : null}
          <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
            {state.twin.goal.title}
          </h2>
          <p className="mt-3 text-sm text-muted md:text-base">
            Target date {format(new Date(state.twin.goal.targetDate), "PPP")} · Roadmap version{" "}
            {metrics.roadmapVersion}
          </p>
        </div>
        <div className="text-sm text-muted">
          Adaptive learning twin active
          {mission.assessmentHref ? (
            <>
              {" · "}
              <Link
                href={mission.assessmentHref}
                className="text-cyan-300 underline-offset-4 hover:underline"
              >
                Start topic check-in
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

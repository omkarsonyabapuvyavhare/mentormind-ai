"use client";

import { format } from "date-fns";
import { ArrowDown, ArrowUp, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { theme, type MilestoneStatusKey } from "@/constants/theme";
import { thresholds } from "@/constants/thresholds";
import {
  selectRoadmapAccelerationDays,
  selectTasksByMilestone,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";
import type { Milestone } from "@/types/roadmap";

import { TaskCard } from "./task-card";

const statusStyles = theme.badges.milestone;

export function MilestoneCard({
  milestone,
  tasks,
  accelerationDays,
}: {
  milestone: Milestone;
  tasks: ReturnType<typeof selectTasksByMilestone> extends Map<string, infer T> ? T : never;
  accelerationDays: number | null;
}) {
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <GlassCard className={milestone.status === "current" ? "border-cyan-400/30" : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Week {milestone.order}</p>
          <h3 className="mt-1 text-lg font-semibold">
            {milestone.title.replace(/^Week \d+ — /, "")}
          </h3>
          <p className="mt-2 text-sm text-muted">
            Target {format(new Date(milestone.targetDate), "PPP")} · {progress}% complete
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={statusStyles[milestone.status as MilestoneStatusKey]}>
            {milestone.status}
          </Badge>
          {milestone.status === "delayed" ? (
            <Badge className={theme.badges.warning}>
              <Clock3 className="mr-1 h-3 w-3" />
              Shifted +{thresholds.milestoneDelayDays} days
            </Badge>
          ) : null}
          {accelerationDays && milestone.status !== "completed" ? (
            <Badge className={theme.badges.success}>
              <ArrowUp className="mr-1 h-3 w-3" />
              Accelerated by {accelerationDays} days
            </Badge>
          ) : null}
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </GlassCard>
  );
}

export function MilestoneTimeline() {
  const roadmap = useAppStore((state) => state.roadmap);
  const tasksByMilestone = selectTasksByMilestone(useAppStore());
  const accelerationDays = selectRoadmapAccelerationDays(useAppStore());

  if (!roadmap) {
    return null;
  }

  const milestones = [...roadmap.milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <ArrowDown className="h-4 w-4" />
        Eight-week milestone timeline
      </div>
      {milestones.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          tasks={tasksByMilestone.get(milestone.id) ?? []}
          accelerationDays={
            accelerationDays && milestone.order >= 5 ? accelerationDays : null
          }
        />
      ))}
    </div>
  );
}

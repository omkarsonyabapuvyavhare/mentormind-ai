"use client";

import { format } from "date-fns";
import { BookOpen, FlaskConical, HelpCircle, RotateCcw } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { theme, type TaskTypeKey } from "@/constants/theme";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";
import type { TaskType } from "@/types/roadmap";

const taskIcons: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  lesson: BookOpen,
  quiz: HelpCircle,
  revision: RotateCcw,
  lab: FlaskConical,
  review: BookOpen,
};

export function UpcomingTasksCard() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Upcoming tasks</h3>
      <ul className="mt-5 space-y-3">
        {metrics.upcomingTasks.length === 0 ? (
          <li className="text-sm text-muted">No unlocked pending tasks right now.</li>
        ) : (
          metrics.upcomingTasks.map((task) => {
            const Icon = taskIcons[task.type];
            return (
              <li
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted">{task.estimatedMinutes} minutes</p>
                  </div>
                </div>
                <Badge className={theme.badges.task[task.type as TaskTypeKey]}>{task.type}</Badge>
              </li>
            );
          })
        )}
      </ul>
    </GlassCard>
  );
}

export function CurrentMilestoneCard() {
  const metrics = selectDashboardMetrics(useAppStore());
  const milestone = metrics.currentMilestone;

  if (!milestone) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold">Current milestone</h3>
        <p className="mt-3 text-sm text-muted">No active milestone available.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Current milestone</h3>
      <p className="mt-3 text-xl font-medium">{milestone.title.replace(/^Week \d+ — /, "")}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
        <Badge className="capitalize">{milestone.status}</Badge>
        <span>Target {format(new Date(milestone.targetDate), "PPP")}</span>
        <span>{metrics.milestoneProgress}% complete</span>
      </div>
    </GlassCard>
  );
}

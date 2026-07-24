"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import {
  selectLatestDecisionInjectedTasks,
  selectMilestoneIdsWithRecentChanges,
  selectRoadmapAccelerationDays,
  selectTasksByMilestone,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

import { TaskCard } from "./task-card";

export function RoadmapChangesTimeline() {
  const state = useAppStore();
  const roadmap = state.roadmap;
  const changedMilestoneIds = selectMilestoneIdsWithRecentChanges(state);
  const injectedTasks = selectLatestDecisionInjectedTasks(state);
  const tasksByMilestone = selectTasksByMilestone(state);
  const accelerationDays = selectRoadmapAccelerationDays(state);
  const [expandedUnchanged, setExpandedUnchanged] = useState(false);

  if (!roadmap) {
    return null;
  }

  const milestones = [...roadmap.milestones].sort((a, b) => a.order - b.order);
  const changed = milestones.filter((m) => changedMilestoneIds.has(m.id));
  const unchanged = milestones.filter((m) => !changedMilestoneIds.has(m.id));

  return (
    <div className="space-y-5">
      {changed.length > 0 ? (
        <>
          <p className="text-sm text-violet-200">Changed in your latest session</p>
          {changed.map((milestone) => {
            const tasks = tasksByMilestone.get(milestone.id) ?? [];
            const highlighted = tasks.filter(
              (task) => task.injectedBy || injectedTasks.some((injected) => injected.id === task.id),
            );

            return (
              <GlassCard key={milestone.id} className={`${theme.cards.adaptation} animate-reveal-in`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={theme.badges.injected}>Updated</Badge>
                  {milestone.status === "delayed" ? (
                    <Badge className={theme.badges.warning}>Milestone delayed</Badge>
                  ) : null}
                  {accelerationDays && milestone.order >= 5 ? (
                    <Badge className={theme.badges.success}>Accelerated {accelerationDays} days</Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold">
                  {milestone.title.replace(/^Week \d+ — /, "")}
                </h3>
                <p className="mt-1 text-sm text-muted">Target {format(new Date(milestone.targetDate), "PPP")}</p>
                <ul className="mt-5 space-y-3">
                  {(highlighted.length > 0 ? highlighted : tasks).map((task) => (
                    <TaskCard key={task.id} task={task} emphasize={Boolean(task.injectedBy)} />
                  ))}
                </ul>
              </GlassCard>
            );
          })}
        </>
      ) : (
        <GlassCard>
          <p className="text-sm text-muted">No roadmap changes yet. Complete today&apos;s session first.</p>
        </GlassCard>
      )}

      {unchanged.length > 0 ? (
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            onClick={() => setExpandedUnchanged((value) => !value)}
          >
            {expandedUnchanged ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {expandedUnchanged ? "Hide" : "Show"} {unchanged.length} unchanged milestones
          </button>
          {expandedUnchanged ? (
            <div className="mt-4 space-y-4 opacity-60">
              {unchanged.map((milestone) => (
                <GlassCard key={milestone.id}>
                  <h3 className="text-base font-medium">{milestone.title.replace(/^Week \d+ — /, "")}</h3>
                  <ul className="mt-4 space-y-2">
                    {(tasksByMilestone.get(milestone.id) ?? []).slice(0, 2).map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

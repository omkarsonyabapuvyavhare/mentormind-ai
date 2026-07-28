"use client";

import { format } from "date-fns";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { useRoadmapCompletion } from "@/hooks/use-roadmap-completion";
import { summarizeRoadmapTaskStatuses } from "@/lib/roadmap/complete-roadmap-task";
import { computeRoadmapCompletion } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function RoadmapHeader() {
  const twin = useAppStore((state) => state.twin);
  const roadmap = useAppStore((state) => state.roadmap);
  const tasks = useAppStore((state) => state.roadmap?.tasks);
  const completion = useRoadmapCompletion();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !roadmap || !tasks) {
      return;
    }

    console.info("[RoadmapCompletion]", {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        topicId: task.topicId,
        type: task.type,
        status: task.status,
        unlocked: task.unlocked,
      })),
      completion: computeRoadmapCompletion(tasks),
      statusDistribution: summarizeRoadmapTaskStatuses(tasks),
    });
  }, [roadmap, tasks]);

  if (!twin || !roadmap) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold md:text-3xl">{twin.goal.title}</h2>
        <p className="mt-2 text-sm text-muted">
          Target {format(new Date(twin.goal.targetDate), "PPP")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-end">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Overall completion</span>
            <span className="font-medium">{completion.percentage}%</span>
          </div>
          <ProgressBar
            value={completion.percentage}
            label="Overall roadmap completion"
          />
          <p className="mt-2 text-sm text-muted">
            {completion.completedTasks} of {completion.totalTasks} tasks completed
          </p>
        </div>
        <RoadmapVersionBadge version={roadmap.version} />
      </div>
    </div>
  );
}

export function RoadmapVersionBadge({ version }: { version: number }) {
  return (
    <Badge className="justify-center border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
      Roadmap v{version}
    </Badge>
  );
}

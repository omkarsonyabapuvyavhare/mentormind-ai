"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { selectRoadmapCompletion } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function RoadmapHeader() {
  const twin = useAppStore((state) => state.twin);
  const roadmap = useAppStore((state) => state.roadmap);
  const completion = selectRoadmapCompletion(useAppStore());

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
            <span className="font-medium">{completion}%</span>
          </div>
          <ProgressBar value={completion} />
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

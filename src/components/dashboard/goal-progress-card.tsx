"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { useRoadmapCompletion } from "@/hooks/use-roadmap-completion";
import { resolveTopicDisplayName } from "@/lib/learner/resolve-topic-display-name";
import { formatStudyHours } from "@/lib/utils";
import { selectNextTask } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function GoalProgressCard() {
  const completion = useRoadmapCompletion();
  const twin = useAppStore((state) => state.twin);
  const roadmap = useAppStore((state) => state.roadmap);
  const spentMinutes = useAppStore((state) => state.twin?.totalStudyMinutes ?? 0);
  const plannedMinutes = useAppStore((state) => state.twin?.plannedStudyMinutes ?? 0);
  const nextTask = useAppStore((state) => selectNextTask(state));
  const timePercent =
    plannedMinutes === 0 ? 0 : Math.round((spentMinutes / plannedMinutes) * 100);
  const goalPhrase = twin?.goal.type === "Certification" ? "certification goal" : "learning goal";
  const nextTopicName = nextTask
    ? resolveTopicDisplayName({ twin, roadmap }, nextTask.topicId)
    : "your next milestone";

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Time tracking</h3>
      <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
        <ProgressRing value={completion.percentage} label="Overall completion" />
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Time spent</span>
            <span className="font-medium">
              {formatStudyHours(spentMinutes)} / {formatStudyHours(plannedMinutes)}
            </span>
          </div>
          <ProgressBar value={timePercent} className="mt-3" />
          <p className="mt-3 text-sm text-muted">
            {timePercent}% of planned study time logged toward your {goalPhrase}. Next focus:{" "}
            {nextTopicName}.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

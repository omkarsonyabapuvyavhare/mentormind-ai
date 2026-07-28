"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useRoadmapCompletion } from "@/hooks/use-roadmap-completion";
import {
  selectCurrentStreak,
  selectDropoutRiskLevel,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function LearnerContextPanel() {
  const twin = useAppStore((state) => state.twin);
  const roadmapVersion = useAppStore((state) => state.roadmap?.version ?? 1);
  const completion = useRoadmapCompletion();
  const streak = useAppStore(selectCurrentStreak);
  const riskLevel = useAppStore(selectDropoutRiskLevel);
  const weaknesses = twin?.weaknesses ?? [];

  if (!twin) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Learner context</h3>
      <dl className="mt-4 grid gap-3 text-sm">
        <ContextItem label="Goal" value={twin.goal.title} />
        <ContextItem label="Skill level" value={twin.skillLevel} />
        <ContextItem label="Completion" value={`${completion.percentage}%`} />
        <ContextItem label="Streak" value={`${streak} days`} />
        <ContextItem label="Risk level" value={riskLevel} />
        <ContextItem
          label="Weak topics"
          value={
            weaknesses.map((topic) => topic.topicName).join(", ") || "None confirmed"
          }
        />
        <ContextItem label="Roadmap version" value={`v${roadmapVersion}`} />
      </dl>
    </GlassCard>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right capitalize">{value}</dd>
    </div>
  );
}

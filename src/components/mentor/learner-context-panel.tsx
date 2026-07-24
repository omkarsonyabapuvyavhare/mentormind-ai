"use client";

import { GlassCard } from "@/components/ui/glass-card";
import {
  selectCurrentStreak,
  selectDropoutRiskLevel,
  selectRoadmapCompletion,
  selectWeakTopics,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function LearnerContextPanel() {
  const state = useAppStore();
  const twin = state.twin;

  if (!twin) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Learner context</h3>
      <dl className="mt-4 grid gap-3 text-sm">
        <ContextItem label="Goal" value={twin.goal.title} />
        <ContextItem label="Skill level" value={twin.skillLevel} />
        <ContextItem label="Completion" value={`${selectRoadmapCompletion(state)}%`} />
        <ContextItem label="Streak" value={`${selectCurrentStreak(state)} days`} />
        <ContextItem label="Risk level" value={selectDropoutRiskLevel(state)} />
        <ContextItem
          label="Weak topics"
          value={
            selectWeakTopics(state)
              .map((topic) => topic.topicName)
              .join(", ") || "None confirmed"
          }
        />
        <ContextItem label="Roadmap version" value={`v${state.roadmap?.version ?? 1}`} />
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

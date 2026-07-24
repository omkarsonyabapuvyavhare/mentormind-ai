"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { selectStrongestTopic } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function StrengthsCard() {
  const state = useAppStore();
  const strengths = state.twin?.strengths ?? [];
  const strongest = selectStrongestTopic(state);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Strengths</h3>
      {strengths.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No confirmed strengths yet. Mastery assessments will populate this profile.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {strengths.map((topic) => (
            <li
              key={topic.topicId}
              className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3"
            >
              <span>{topic.topicName}</span>
              <span className="font-medium text-emerald-200">{topic.score}%</span>
            </li>
          ))}
        </ul>
      )}
      {strongest ? (
        <p className="mt-4 text-sm text-muted">Strongest topic: {strongest.topicName}</p>
      ) : null}
    </GlassCard>
  );
}

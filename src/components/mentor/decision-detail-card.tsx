"use client";

import { GoalAwareAdaptationCard } from "@/components/shared/goal-aware-adaptation-card";
import { GlassCard } from "@/components/ui/glass-card";
import { selectDecisionGoalLine, selectGoalAwareAdaptation } from "@/lib/ai/reasoning-summary";
import { useAppStore } from "@/stores/use-app-store";
import type { Decision } from "@/types/decisions";

export function DecisionDetailCard({ decision }: { decision: Decision | null }) {
  const state = useAppStore.getState();
  const adaptation = decision ? selectGoalAwareAdaptation(state, decision) : null;
  const goalLine = selectDecisionGoalLine(state, decision);

  if (!decision) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold">Decision detail</h3>
        <p className="mt-3 text-sm text-muted">Complete a session to inspect how MentorMind reasoned about your plan.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="text-lg font-semibold">Decision detail</h3>
        {goalLine ? <p className="mt-4 text-sm leading-7 font-medium">{goalLine}</p> : null}
        <p className="mt-3 text-sm leading-7 text-muted">{decision.explanation}</p>
      </GlassCard>
      {adaptation ? <GoalAwareAdaptationCard adaptation={adaptation} title="Adaptation breakdown" /> : null}
    </div>
  );
}

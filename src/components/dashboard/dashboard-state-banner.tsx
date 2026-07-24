"use client";

import { AlertTriangle, Sparkles, Trophy } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import {
  selectLatestDecision,
  selectWeakTopics,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardStateBanner() {
  const state = useAppStore();
  const decision = selectLatestDecision(state);
  const weaknesses = selectWeakTopics(state);

  if (decision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return (
      <GlassCard className={theme.cards.success}>
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <p className="font-semibold text-emerald-100">Mastery achieved</p>
            <p className="mt-2 text-sm leading-7 text-emerald-50/90">{decision.explanation}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (weaknesses.length > 0 && decision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return (
      <GlassCard className={theme.cards.warning}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold text-amber-100">Adaptation active — remediation in progress</p>
            <p className="mt-2 text-sm leading-7 text-amber-50/90">{decision.explanation}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (decision?.reasons.includes("INACTIVITY_ESCALATION")) {
    return (
      <GlassCard className={theme.cards.adaptation}>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
          <div>
            <p className="font-semibold text-violet-100">Dropout-risk intervention</p>
            <p className="mt-2 text-sm leading-7 text-violet-50/90">{decision.explanation}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return null;
}

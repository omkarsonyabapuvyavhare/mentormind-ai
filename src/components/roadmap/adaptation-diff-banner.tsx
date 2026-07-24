"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AccountabilityPartnerCard } from "@/components/shared/accountability-partner-card";
import { GoalAwareAdaptationCard } from "@/components/shared/goal-aware-adaptation-card";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { routes } from "@/constants/routes";
import { selectSessionPrimaryAction } from "@/lib/demo/session-actions";
import { selectRoadmapAccountabilityPartner } from "@/lib/ai/accountability-nudge";
import { selectDecisionGoalLine, selectGoalAwareAdaptation } from "@/lib/ai/reasoning-summary";
import { selectLatestDecision } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function AdaptationDiffBanner() {
  const state = useAppStore();
  const decision = selectLatestDecision(state);
  const adaptation = selectGoalAwareAdaptation(state);
  const partner = selectRoadmapAccountabilityPartner(state);
  const nextAction = selectSessionPrimaryAction(state);
  const goalLine = selectDecisionGoalLine(state, decision);

  if (!decision || !adaptation) {
    return partner ? <AccountabilityPartnerCard message={partner} /> : null;
  }

  return (
    <div className="space-y-4">
      {partner ? <AccountabilityPartnerCard message={partner} /> : null}

      <GlassCard className={theme.cards.adaptation}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-300" />
          <h3 className="text-lg font-semibold">Mentor reasoning</h3>
        </div>
        {goalLine ? <p className="mt-3 text-sm leading-7">{goalLine}</p> : null}
        <p className="mt-3 text-sm text-muted">{decision.explanation}</p>
      </GlassCard>

      <GoalAwareAdaptationCard adaptation={adaptation} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={nextAction.href}>{nextAction.label}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={routes.dashboard}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

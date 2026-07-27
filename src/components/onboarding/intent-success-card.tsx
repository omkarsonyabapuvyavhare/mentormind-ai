"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  GOAL_INTENT_CONTINUE_LABEL,
  GOAL_INTENT_SUCCESS_READY_LINE,
  GOAL_INTENT_SUCCESS_TITLE,
} from "@/lib/onboarding/goal-intent-constants";
import type { IntentSuccessSummary } from "@/lib/onboarding/format-intent-success";

export function IntentSuccessCard({
  summary,
  onContinue,
}: {
  summary: IntentSuccessSummary;
  onContinue: () => void;
}) {
  return (
    <GlassCard className="border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.08] to-transparent">
      <Badge className="border-cyan-400/20 bg-cyan-400/10 text-[11px] uppercase tracking-wide text-cyan-100">
        {summary.goalTypeLabel}
      </Badge>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">{GOAL_INTENT_SUCCESS_TITLE}</h2>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Goal" value={summary.goalTitle} />
        <SummaryItem label="Category" value={summary.category} />
        <SummaryItem label="Type" value={summary.goalType} />
        <SummaryItem label="Target outcome" value={summary.targetOutcome} />
      </dl>
      <p className="mt-6 text-sm leading-6 text-muted">{GOAL_INTENT_SUCCESS_READY_LINE}</p>
      <Button className="mt-5 w-full sm:w-auto" onClick={onContinue}>
        {GOAL_INTENT_CONTINUE_LABEL}
      </Button>
    </GlassCard>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-medium leading-6">{value}</dd>
    </div>
  );
}

"use client";

import { Target } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import type { GoalAwareAdaptation } from "@/lib/ai/reasoning-summary";

export function GoalAwareAdaptationCard({
  adaptation,
  title = "Why your plan changed",
  className,
}: {
  adaptation: GoalAwareAdaptation;
  title?: string;
  className?: string;
}) {
  return (
    <GlassCard className={className}>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-cyan-300" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-muted">
        Goal: <span className="text-foreground">{adaptation.goalLabel}</span>
      </p>

      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        <ReasonRow label="Signal" value={adaptation.trigger} />
        <ReasonRow label="What changed" value={adaptation.whatChanged} />
        <ReasonRow label="Why it changed" value={adaptation.whyChanged} className="md:col-span-2" />
        <ReasonRow label="How this helps your goal" value={adaptation.goalImpact} className="md:col-span-2" />
      </dl>
    </GlassCard>
  );
}

function ReasonRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-7">{value}</dd>
    </div>
  );
}

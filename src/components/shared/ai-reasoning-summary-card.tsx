"use client";

import { BrainCircuit } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import type { AssessmentReasoningSummary } from "@/lib/ai/reasoning-summary";

const ROWS: Array<{ key: keyof AssessmentReasoningSummary; label: string }> = [
  { key: "signalDetected", label: "Signal detected" },
  { key: "learningTwinUpdate", label: "Learning Twin updated" },
  { key: "decisionMade", label: "Decision made" },
  { key: "expectedBenefit", label: "Expected benefit" },
];

export function AiReasoningSummaryCard({
  summary,
  action,
}: {
  summary: AssessmentReasoningSummary;
  action?: React.ReactNode;
}) {
  return (
    <GlassCard className={theme.cards.adaptation}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">AI reasoning summary</p>
          <p className="mt-2 text-sm text-muted">
            Goal: <span className="text-foreground">{summary.goalLabel}</span>
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-4">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-1 text-sm leading-7">{summary[key]}</dd>
          </div>
        ))}
      </dl>

      {action ? <div className="mt-6">{action}</div> : null}
    </GlassCard>
  );
}

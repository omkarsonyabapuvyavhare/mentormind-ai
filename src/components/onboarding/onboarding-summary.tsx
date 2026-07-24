"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  onboardingIntentMessage,
  onboardingPersonalizedLabel,
} from "@/constants/onboarding";
import type { OnboardingIntentSummary } from "@/lib/onboarding/create-from-input";
import { isSupportedOnboardingGoal } from "@/lib/onboarding/create-from-input";
import type { OnboardingInput } from "@/lib/onboarding/schema";

export function OnboardingSummary({
  input,
  summary,
}: {
  input: OnboardingInput;
  summary: OnboardingIntentSummary;
}) {
  const supported = isSupportedOnboardingGoal(input.goalId);

  return (
    <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
      <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
        {onboardingPersonalizedLabel}
      </Badge>
      <h2 className="mt-4 text-xl font-semibold">Goal understanding summary</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{onboardingIntentMessage}</p>

      {!supported ? (
        <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          This goal uses a prototype template in the MVP. The AWS SAA plan is fully optimized.
        </p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Goal" value={summary.goal} />
        <SummaryItem label="Outcome" value={summary.outcome} />
        <SummaryItem label="Current level" value={summary.currentLevel} />
        <SummaryItem label="Timeline" value={summary.timeline} />
        <SummaryItem label="Availability" value={summary.availability} />
        <SummaryItem label="Preferences" value={summary.preferences} />
        <SummaryItem label="Known challenge" value={summary.knownChallenge} />
      </dl>
    </GlassCard>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-medium">{value}</dd>
    </div>
  );
}

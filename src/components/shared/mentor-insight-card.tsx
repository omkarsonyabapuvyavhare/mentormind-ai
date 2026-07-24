"use client";

import { Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { MENTOR_VOICE } from "@/constants/mentor-voice";
import { theme } from "@/constants/theme";
import type { MentorInsight } from "@/lib/ai/page-insights";

export function MentorInsightCard({ insight }: { insight: MentorInsight }) {
  return (
    <GlassCard className={theme.cards.adaptation}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">
            {MENTOR_VOICE.eyebrow}
          </p>
          <p className="mt-4 text-xl font-semibold leading-snug md:text-2xl">{insight.what}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
        <InsightItem label={MENTOR_VOICE.insightLabels.why} value={insight.why} />
        <InsightItem
          label={MENTOR_VOICE.insightLabels.expectedBenefit}
          value={insight.expectedBenefit}
        />
      </dl>
    </GlassCard>
  );
}

function InsightItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-2 text-sm leading-7">{value}</dd>
    </div>
  );
}

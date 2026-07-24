"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { selectMentorRecommendation } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function MentorSummaryCard() {
  const recommendation = selectMentorRecommendation(useAppStore());

  return (
    <GlassCard className={theme.cards.adaptation}>
      <p className="text-sm uppercase tracking-[0.18em] text-violet-200">AI Mentor Decision Center</p>
      <p className="mt-4 text-sm leading-7 md:text-base">
        Explainable guidance powered by your Learning Twin, latest decisions, and roadmap state.
        This is not a free-form chatbot — every response is grounded in current learner data.
      </p>
      <p className="mt-4 text-sm text-muted">Current focus: {recommendation}</p>
    </GlassCard>
  );
}

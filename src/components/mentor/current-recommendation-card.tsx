"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { selectMentorRecommendation } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function CurrentRecommendationCard() {
  const recommendation = selectMentorRecommendation(useAppStore());

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Current recommendation</h3>
      <p className="mt-4 text-sm leading-7 md:text-base">{recommendation}</p>
    </GlassCard>
  );
}

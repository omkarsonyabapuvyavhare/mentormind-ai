"use client";

import { GoalAwareAdaptationCard } from "@/components/shared/goal-aware-adaptation-card";
import { GlassCard } from "@/components/ui/glass-card";
import type { GoalAwareAdaptation } from "@/lib/ai/reasoning-summary";

export function AdaptationSummary({
  title,
  explanation,
  adaptation,
  highlights,
}: {
  title: string;
  explanation: string;
  adaptation: GoalAwareAdaptation | null;
  highlights: string[];
}) {
  return (
    <div className="space-y-4">
      <GlassCard className="border-violet-400/20 bg-violet-400/5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-3 text-sm text-muted">{explanation}</p>

        {highlights.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {highlights.map((item, index) => (
              <li key={`${index}-${item}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </GlassCard>

      {adaptation ? (
        <GoalAwareAdaptationCard adaptation={adaptation} />
      ) : (
        <GlassCard>
          <p className="text-sm text-muted">No adaptation was generated for this result.</p>
        </GlassCard>
      )}
    </div>
  );
}

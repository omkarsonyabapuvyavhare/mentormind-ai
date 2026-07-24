"use client";

import { BrainCircuit } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";

export function TwinInfluencePanel() {
  return (
    <GlassCard className={theme.cards.adaptation}>
      <div className="flex items-start gap-3">
        <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
        <div>
          <h3 className="text-lg font-semibold">How this influences decisions</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Every signal on this page feeds the deterministic AI Decision Engine. Quiz scores
            update strengths and weaknesses. Inactivity adjusts dropout risk and session length.
            Preferences shape nudges and recommendations. The Learning Twin is persistent memory —
            not a static profile card.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { selectLiveLoopSteps } from "@/lib/demo/session-actions";
import { useAppStore } from "@/stores/use-app-store";

export function LiveLoopStepper() {
  const steps = selectLiveLoopSteps(useAppStore());

  return (
    <GlassCard className="border-white/10 bg-white/[0.03]">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Your learning loop</p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const Icon = step.complete ? CheckCircle2 : Circle;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                step.current
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : step.complete
                    ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
                    : "border-white/10 bg-white/5 text-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{step.label}</span>
              {index < steps.length - 1 ? (
                <span className="hidden text-muted sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}

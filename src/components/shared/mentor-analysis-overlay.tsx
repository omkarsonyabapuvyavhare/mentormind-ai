"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

const DEFAULT_STEPS = [
  "Processing quiz",
  "Updating Learning Twin",
  "Rebuilding roadmap",
  "Preparing explanation",
];

const ONBOARDING_STEPS = [
  "Reading your goal",
  "Building Learning Twin",
  "Generating roadmap",
  "Preparing your mentor",
];

export function MentorAnalysisOverlay({
  title,
  subtitle,
  steps = DEFAULT_STEPS,
  durationMs = 2600,
  onComplete,
}: {
  title: string;
  subtitle?: string;
  steps?: string[];
  durationMs?: number;
  onComplete: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepDelay = durationMs / steps.length;

  useEffect(() => {
    const timers = steps.map((_, index) =>
      window.setTimeout(() => setActiveIndex(index + 1), stepDelay * (index + 1)),
    );

    const completeTimer = window.setTimeout(onComplete, durationMs);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete, stepDelay, steps]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b18]/85 p-4 backdrop-blur-md">
      <GlassCard className="w-full max-w-md border-violet-400/25 bg-[#0a1628]/95 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Your AI Mentor</p>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
        {subtitle ? <p className="mt-4 text-sm text-muted">{subtitle}</p> : null}

        <ul className="mt-6 space-y-3">
          {steps.map((step, index) => {
            const done = activeIndex > index;
            const current = activeIndex === index;

            return (
              <li
                key={step}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-500 ${
                  done
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                    : current
                      ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-muted"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                ) : current ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-300" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
                )}
                {step}
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </div>
  );
}

export { ONBOARDING_STEPS, DEFAULT_STEPS };

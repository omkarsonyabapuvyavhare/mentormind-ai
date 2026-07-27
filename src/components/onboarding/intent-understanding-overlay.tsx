"use client";

import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  GOAL_INTENT_LOADING_CHECKLIST,
  GOAL_INTENT_LOADING_TITLE,
} from "@/lib/onboarding/goal-intent-constants";

export function IntentUnderstandingOverlay() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) =>
        Math.min(current + 1, GOAL_INTENT_LOADING_CHECKLIST.length - 1),
      );
    }, 400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={GOAL_INTENT_LOADING_TITLE}
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-cyan-400/10 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">Step 1 of 5</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{GOAL_INTENT_LOADING_TITLE}</h2>
        <ul className="mt-7 space-y-2.5">
          {GOAL_INTENT_LOADING_CHECKLIST.map((item, index) => {
            const complete = index < activeIndex;
            const active = index === activeIndex;

            return (
              <li
                key={item}
                className={`animate-fade-in flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-500 ${
                  complete
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : active
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                      : "border-white/10 bg-white/[0.03] text-muted opacity-70"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {complete ? (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-300 transition-transform duration-300"
                    aria-hidden="true"
                  />
                ) : active ? (
                  <LoaderCircle
                    className="h-4 w-4 shrink-0 animate-spin text-cyan-300"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted/60" aria-hidden="true" />
                )}
                <span className={complete ? "font-medium" : undefined}>
                  {complete ? `✓ ${item}` : item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

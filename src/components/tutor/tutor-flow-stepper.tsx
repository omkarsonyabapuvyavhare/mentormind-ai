"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "mission", label: "Today's mission" },
  { id: "learn", label: "Learn" },
  { id: "assess", label: "Assess" },
  { id: "feedback", label: "Feedback" },
  { id: "plan", label: "Updated plan" },
] as const;

export type TutorFlowStep = (typeof STEPS)[number]["id"];

export function TutorFlowStepper({
  current,
  className,
}: {
  current: TutorFlowStep;
  className?: string;
}) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className={cn("flex flex-wrap gap-2", className)} aria-label="Learning progress">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              done
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                : active
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border-white/10 bg-white/5 text-muted",
            )}
          >
            {done ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current opacity-40" />}
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

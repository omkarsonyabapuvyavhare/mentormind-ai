"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { onboardingGoalTemplates } from "@/constants/onboarding";
import type { OnboardingInput } from "@/lib/onboarding/schema";

export function GoalStep({
  value,
  onChange,
}: {
  value: OnboardingInput["goalId"];
  onChange: (goalId: OnboardingInput["goalId"]) => void;
}) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Choose your learning goal</h2>
      <p className="mt-2 text-sm text-muted">
        MentorMind builds a structured certification roadmap from your goal.
      </p>
      <div className="mt-6 space-y-3">
        {onboardingGoalTemplates.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => onChange(goal.id)}
            className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
              value === goal.id
                ? "border-cyan-400/40 bg-cyan-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{goal.title}</p>
              {goal.supported ? (
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  Optimized template
                </Badge>
              ) : (
                <Badge className="border-white/10 bg-white/5 text-muted">Prototype</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">Outcome: {goal.outcome}</p>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

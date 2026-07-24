"use client";

import { GlassCard } from "@/components/ui/glass-card";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { SkillLevel } from "@/types/learning-twin";

const levels: { value: SkillLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "New to cloud or certification prep" },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some AWS exposure and prior study experience",
  },
  { value: "advanced", label: "Advanced", description: "Strong foundation, exam-focused refinement" },
];

export function SkillLevelStep({
  value,
  onChange,
}: {
  value: OnboardingInput["skillLevel"];
  onChange: (skillLevel: SkillLevel) => void;
}) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Current skill level</h2>
      <p className="mt-2 text-sm text-muted">
        This helps MentorMind calibrate pacing and prerequisite emphasis.
      </p>
      <div className="mt-6 space-y-3">
        {levels.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
              value === level.value
                ? "border-cyan-400/40 bg-cyan-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="font-medium">{level.label}</p>
            <p className="mt-1 text-sm text-muted">{level.description}</p>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

"use client";

import { FieldHintBadge } from "@/components/onboarding/field-hint-badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { FieldWithSource } from "@/lib/onboarding/onboarding-draft";
import type { SkillLevel } from "@/types/learning-twin";

const levels: { value: SkillLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Complete beginner", description: "New to this topic or skill area" },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some prior exposure and practical experience",
  },
  { value: "advanced", label: "Advanced", description: "Strong foundation and exam- or project-ready skills" },
];

function formatSkillLabel(skillLevel: SkillLevel): string {
  return skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

export function SkillLevelStep({
  value,
  suggestion,
  onChange,
}: {
  value: SkillLevel | null;
  suggestion?: FieldWithSource<SkillLevel> | null;
  onChange: (skillLevel: SkillLevel) => void;
}) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Current skill level</h2>
      <p className="mt-2 text-sm text-muted">
        Choose the level that best matches where you are today. MentorMind uses this to calibrate
        pacing and prerequisite emphasis.
      </p>

      {suggestion ? (
        <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
          <p className="text-sm font-medium">Suggested based on your description</p>
          <p className="mt-1 text-sm text-muted">{formatSkillLabel(suggestion.value)}</p>
          <FieldHintBadge source={suggestion.source} />
        </div>
      ) : null}

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

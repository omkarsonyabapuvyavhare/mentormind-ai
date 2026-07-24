"use client";

import { GlassCard } from "@/components/ui/glass-card";

export function AvailabilityStep({
  durationWeeks,
  studyHoursPerWeek,
  onDurationChange,
  onHoursChange,
}: {
  durationWeeks: number;
  studyHoursPerWeek: number;
  onDurationChange: (weeks: number) => void;
  onHoursChange: (hours: number) => void;
}) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Timeline and availability</h2>
      <p className="mt-2 text-sm text-muted">
        MentorMind uses this to plan milestones and weekly study load.
      </p>
      <div className="mt-6 space-y-6">
        <label className="block">
          <span className="text-sm text-muted">Target duration (weeks)</span>
          <input
            type="number"
            min={4}
            max={16}
            value={durationWeeks}
            onChange={(event) => onDurationChange(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Available study hours per week</span>
          <input
            type="number"
            min={1}
            max={40}
            value={studyHoursPerWeek}
            onChange={(event) => onHoursChange(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
        </label>
        <p className="text-sm text-muted">
          Planned study time: {studyHoursPerWeek * durationWeeks} hours across {durationWeeks}{" "}
          weeks.
        </p>
      </div>
    </GlassCard>
  );
}

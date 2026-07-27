"use client";

import { FieldHintBadge } from "@/components/onboarding/field-hint-badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { FieldWithSource } from "@/lib/onboarding/onboarding-draft";
import type { StudyTimeOfDay } from "@/types/learning-twin";

const studyTimes: StudyTimeOfDay[] = ["morning", "afternoon", "evening"];

export function AvailabilityStep({
  durationWeeks,
  studyHoursPerWeek,
  studyTimeOfDay,
  focusDurationMinutes,
  durationSource,
  hoursSource,
  studyTimeSource,
  focusSource,
  onDurationChange,
  onHoursChange,
  onStudyTimeChange,
  onFocusDurationChange,
}: {
  durationWeeks: number;
  studyHoursPerWeek: number;
  studyTimeOfDay: StudyTimeOfDay;
  focusDurationMinutes: number;
  durationSource: FieldWithSource<number>["source"];
  hoursSource: FieldWithSource<number>["source"];
  studyTimeSource: FieldWithSource<StudyTimeOfDay>["source"];
  focusSource: FieldWithSource<number>["source"];
  onDurationChange: (weeks: number) => void;
  onHoursChange: (hours: number) => void;
  onStudyTimeChange: (time: StudyTimeOfDay) => void;
  onFocusDurationChange: (minutes: number) => void;
}) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Timeline and availability</h2>
      <p className="mt-2 text-sm text-muted">
        Confirm how long you want to study and when you can realistically learn each week.
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
          <FieldHintBadge source={durationSource} />
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
          <FieldHintBadge source={hoursSource} />
        </label>

        <div>
          <p className="text-sm text-muted">Preferred study time</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {studyTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onStudyTimeChange(time)}
                className={`rounded-xl px-4 py-2 text-sm capitalize ${
                  studyTimeOfDay === time
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-white/5 text-muted"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <FieldHintBadge source={studyTimeSource} />
        </div>

        <label className="block">
          <span className="text-sm text-muted">Focus session duration (minutes)</span>
          <input
            type="number"
            min={15}
            max={120}
            value={focusDurationMinutes}
            onChange={(event) => onFocusDurationChange(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
          <FieldHintBadge source={focusSource} />
        </label>

        <p className="text-sm text-muted">
          Planned study time: {studyHoursPerWeek * durationWeeks} hours across {durationWeeks}{" "}
          weeks.
        </p>
      </div>
    </GlassCard>
  );
}

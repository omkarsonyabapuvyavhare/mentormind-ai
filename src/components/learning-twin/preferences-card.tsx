"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useAppStore } from "@/stores/use-app-store";

export function PreferencesCard() {
  const twin = useAppStore((state) => state.twin);

  if (!twin) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Preferences</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Preferred study time</dt>
          <dd className="capitalize">{twin.preferences.studyTimeOfDay}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Focus duration</dt>
          <dd>{twin.preferences.focusDurationMinutes} minutes</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Preferred formats</dt>
          <dd className="capitalize">{twin.preferences.preferredFormats.join(", ")}</dd>
        </div>
      </dl>
    </GlassCard>
  );
}

"use client";

import { format } from "date-fns";

import { AccountabilityPartnerCard } from "@/components/shared/accountability-partner-card";
import { GlassCard } from "@/components/ui/glass-card";
import { selectActiveAccountabilityPartner } from "@/lib/ai/accountability-nudge";
import { useAppStore } from "@/stores/use-app-store";

export function ActivityPatternCard() {
  const state = useAppStore();
  const twin = state.twin;
  const partner = selectActiveAccountabilityPartner(state);

  if (!twin) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Activity pattern</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Last active</dt>
          <dd>{format(new Date(twin.lastActiveAt), "PP p")}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Inactivity days</dt>
          <dd>{twin.inactivityDays}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Current streak</dt>
          <dd>{twin.currentStreakDays} days</dd>
        </div>
      </dl>
      {partner ? (
        <div className="mt-5">
          <AccountabilityPartnerCard message={partner} compact />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">No active accountability check-in.</p>
      )}
    </GlassCard>
  );
}

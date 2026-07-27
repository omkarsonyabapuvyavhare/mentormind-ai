"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { useLiveLastSeenLabel } from "@/hooks/use-live-last-seen-label";
import {
  formatDropoutRiskLabel,
  formatStreakDisplay,
  getEngagementStatusMeta,
  type EngagementSnapshot,
  type TimelinePreviewFrame,
} from "@/lib/learner/engagement-display";
import { useAppStore } from "@/stores/use-app-store";

export function LearnerEngagementCard({
  snapshot,
  animate = false,
  freezeLastSeen = false,
  className,
  title = "Learner Engagement",
  streakLabel = "Learning streak",
  riskLabel = "Dropout risk",
}: {
  snapshot: EngagementSnapshot | TimelinePreviewFrame;
  animate?: boolean;
  freezeLastSeen?: boolean;
  className?: string;
  title?: string;
  streakLabel?: string;
  riskLabel?: string;
}) {
  const presenterMode = useAppStore((state) => state.presenterMode);
  const learnerEvents = useAppStore((state) => state.learnerEvents);
  const lastSeenLabel = useLiveLastSeenLabel({
    snapshot,
    presenterMode,
    learnerEvents,
    freeze: freezeLastSeen || animate,
  });
  const meta = getEngagementStatusMeta(snapshot.status);
  const statusLabel =
    "statusLabel" in snapshot && snapshot.statusLabel ? snapshot.statusLabel : meta.label;
  const streakValue =
    snapshot.status === "inactive"
      ? "Streak paused"
      : (snapshot.streakDisplay ?? formatStreakDisplay(snapshot.streakDays));
  const riskLevel = snapshot.dropoutRiskLevel;
  const riskScore = snapshot.dropoutRisk;

  return (
    <GlassCard className={className ?? "border-cyan-400/20 bg-cyan-400/5"}>
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{title}</p>

      <div
        key={`${snapshot.status}-${lastSeenLabel}-${riskScore}-${streakValue}`}
        className={animate ? "animate-reveal-in" : undefined}
      >
        <div className="mt-4 flex items-center gap-2">
          <span aria-hidden>{meta.emoji}</span>
          <p className={`text-lg font-semibold ${meta.dotClass}`}>{statusLabel}</p>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <EngagementField label="Last seen" value={lastSeenLabel} />
          <EngagementField label={streakLabel} value={streakValue} />
          <EngagementField
            label={riskLabel}
            value={
              <span className="inline-flex items-center gap-2">
                {formatDropoutRiskLabel(riskLevel)}
                <Badge className={theme.badges.risk[riskLevel]}>{riskScore}</Badge>
              </span>
            }
          />
        </dl>
      </div>
    </GlassCard>
  );
}

function EngagementField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-7">{value}</dd>
    </div>
  );
}

"use client";

import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EnrichedNudgeContext } from "@/lib/ai/reasoning-summary";
import type { Nudge } from "@/types/nudge";

export function EnrichedNudgeCard({
  nudge,
  context,
  compact = false,
}: {
  nudge: Nudge;
  context: EnrichedNudgeContext;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-amber-100">
          <Bell className="h-4 w-4" />
          {nudge.title}
        </div>
        <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-100 capitalize">
          {nudge.severity}
        </Badge>
      </div>

      <dl className={`mt-3 grid gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        <NudgeRow label={context.signalLabel} value={context.signalDetail} />
        <NudgeRow label="Weakest topic" value={context.weakestTopic} />
        <NudgeRow label="Target outcome" value={context.targetOutcome} />
      </dl>

      {!compact ? <p className="mt-3 text-amber-50/90">{nudge.body}</p> : null}
    </div>
  );
}

function NudgeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-amber-50/95">{value}</dd>
    </div>
  );
}

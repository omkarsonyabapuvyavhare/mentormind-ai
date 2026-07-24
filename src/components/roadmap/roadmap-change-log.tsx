"use client";

import { format } from "date-fns";

import { GlassCard } from "@/components/ui/glass-card";
import { useAppStore } from "@/stores/use-app-store";

export function RoadmapChangeLog() {
  const decisions = useAppStore((state) => state.decisions);

  if (decisions.length === 0) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold">Adaptation history</h3>
        <p className="mt-3 text-sm text-muted">
          No roadmap changes yet. Complete an assessment to activate adaptive planning.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Adaptation history</h3>
      <ul className="mt-5 space-y-3">
        {[...decisions].reverse().map((decision) => (
          <li
            key={decision.id}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{decision.eventType.replaceAll("_", " ")}</p>
              <span className="text-muted">{format(new Date(decision.createdAt), "PP p")}</span>
            </div>
            <p className="mt-2 text-muted">{decision.explanation}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

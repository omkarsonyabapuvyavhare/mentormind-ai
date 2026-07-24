"use client";

import { format } from "date-fns";

import { GlassCard } from "@/components/ui/glass-card";
import { useAppStore } from "@/stores/use-app-store";

export function DecisionTimeline({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const decisions = useAppStore((state) => state.decisions);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Decision history</h3>
      {decisions.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No adaptation decisions yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {[...decisions].reverse().map((decision) => (
            <li key={decision.id}>
              <button
                type="button"
                onClick={() => onSelect(decision.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  selectedId === decision.id
                    ? "border-cyan-400/40 bg-cyan-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    {decision.eventType.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="text-muted">{format(new Date(decision.createdAt), "PP p")}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

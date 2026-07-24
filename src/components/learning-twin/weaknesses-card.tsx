"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { routes } from "@/constants/routes";
import { selectAdaptationMessage, selectWeakTopics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function WeaknessesCard() {
  const state = useAppStore();
  const weaknesses = selectWeakTopics(state);
  const knownChallenges = state.twin?.knownChallenges ?? [];

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Weaknesses</h3>
      {weaknesses.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No confirmed weaknesses yet. Your profile adapts after assessments.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {weaknesses.map((topic) => (
            <li
              key={topic.topicId}
              className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3"
            >
              <span>{topic.topicName}</span>
              <span className="font-medium text-amber-200">{topic.score}%</span>
            </li>
          ))}
        </ul>
      )}

      {knownChallenges.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-medium">Self-reported challenges</p>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {knownChallenges.map((topic) => (
              <li key={topic.topicId}>• {topic.topicName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.decisions.length > 0 ? (
        <p className="mt-4 text-sm text-muted">
          Latest adaptation: {selectAdaptationMessage(state)}{" "}
          <Link href={routes.roadmap} className="text-cyan-300 underline-offset-4 hover:underline">
            View roadmap
          </Link>
        </p>
      ) : null}
    </GlassCard>
  );
}

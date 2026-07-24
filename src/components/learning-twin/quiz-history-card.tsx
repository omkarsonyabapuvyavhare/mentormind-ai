"use client";

import { format } from "date-fns";

import { GlassCard } from "@/components/ui/glass-card";
import { getTopicName } from "@/lib/engine/helpers";
import { useAppStore } from "@/stores/use-app-store";

export function QuizHistoryCard() {
  const quizHistory = useAppStore((state) => state.twin?.quizHistory ?? []);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Quiz history</h3>
      {quizHistory.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No quiz attempts recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {quizHistory.map((attempt) => (
            <li
              key={attempt.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{getTopicName(attempt.topicId)}</p>
                <p className="text-muted">{format(new Date(attempt.completedAt), "PP p")}</p>
              </div>
              <span className="font-medium">{attempt.score}%</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

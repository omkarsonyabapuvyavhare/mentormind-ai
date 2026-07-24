"use client";

import { format } from "date-fns";

import { AccountabilityPartnerCard } from "@/components/shared/accountability-partner-card";
import { GlassCard } from "@/components/ui/glass-card";
import { selectActiveAccountabilityPartner } from "@/lib/ai/accountability-nudge";
import { getLearnerEventReactKey } from "@/stores/store-types";
import { useAppStore } from "@/stores/use-app-store";

function formatEventLabel(type: string): string {
  return type.replaceAll("_", " ").toLowerCase();
}

export function LearnerSignalTimeline() {
  const state = useAppStore();
  const events = state.learnerEvents;
  const decisions = state.decisions;
  const partner = selectActiveAccountabilityPartner(state);

  if (events.length === 0 && !partner) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold">Learner signal timeline</h3>
        <p className="mt-3 text-sm text-muted">
          No learner events yet. Quizzes, inactivity, and task activity will appear here.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Learner signal timeline</h3>

      {partner && partner.source !== "welcome_back" ? (
        <div className="mt-4">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">Latest accountability check-in</p>
          <AccountabilityPartnerCard message={partner} compact />
        </div>
      ) : null}

      <ul className={`space-y-3 ${partner ? "mt-6 border-t border-white/10 pt-6" : "mt-4"}`}>
        {[...events].reverse().map((event, index) => {
          const decision = decisions.find(
            (entry) => entry.createdAt === event.timestamp && entry.eventType === event.type,
          );

          return (
            <li
              key={getLearnerEventReactKey(event, index)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium capitalize">{formatEventLabel(event.type)}</p>
                <span className="text-muted">{format(new Date(event.timestamp), "PP p")}</span>
              </div>
              {event.type === "QUIZ_COMPLETED" ? (
                <p className="mt-2 text-muted">
                  {event.topicId} · {event.score}% · {event.totalQuestions} questions
                </p>
              ) : null}
              {event.type === "INACTIVITY_TICK" ? (
                <p className="mt-2 text-muted">{event.days} days inactive</p>
              ) : null}
              {decision && decision.explanation ? (
                <p className="mt-2 text-muted">{decision.explanation}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

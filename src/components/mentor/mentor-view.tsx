"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { DecisionDetailCard } from "@/components/mentor/decision-detail-card";
import { NudgeFeed } from "@/components/mentor/nudge-feed";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { MentorInsightCard } from "@/components/shared/mentor-insight-card";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { answerMentorQuestion } from "@/lib/ai/mentor-responses";
import { selectMentorPageInsight } from "@/lib/ai/page-insights";
import { selectDecisionGoalLine } from "@/lib/ai/reasoning-summary";
import { selectLatestDecision } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function MentorView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const mentorAutoExplain = useAppStore((state) => state.mentorAutoExplain);
  const clearMentorAutoExplain = useAppStore((state) => state.clearMentorAutoExplain);
  const state = useAppStore();
  const latestDecision = selectLatestDecision(state);
  const goalLine = selectDecisionGoalLine(state, latestDecision);

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized || !state.twin) {
    return (
      <EmptyState
        title="Your AI Mentor is not active yet"
        description="MentorMind needs a learner profile before it can recommend your next best action."
      />
    );
  }

  const insight = selectMentorPageInsight(state);
  const autoResponse =
    mentorAutoExplain && latestDecision
      ? answerMentorQuestion("why-roadmap-changed", state)
      : null;

  return (
    <AppShell title="AI Mentor" subtitle={PAGE_QUESTIONS.mentor}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}

      <MentorInsightCard insight={insight} />

      <GlassCard className="border-violet-400/20 bg-violet-400/5">
        <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Mentor response</p>
        <h3 className="mt-3 text-xl font-semibold">Here&apos;s why your roadmap changed</h3>
        {goalLine ? <p className="mt-3 text-sm font-medium leading-7">{goalLine}</p> : null}
        {autoResponse || latestDecision?.explanation ? (
          <p className="mt-4 text-sm leading-8 whitespace-pre-wrap">
            {autoResponse ?? latestDecision?.explanation}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">Complete a session to receive an explainable adaptation.</p>
        )}
      </GlassCard>

      <NudgeFeed />

      {latestDecision ? <DecisionDetailCard decision={latestDecision} /> : null}

      <Button asChild variant="secondary">
        <Link href={routes.dashboard} onClick={() => clearMentorAutoExplain()}>
          Back to Home
        </Link>
      </Button>
    </AppShell>
  );
}

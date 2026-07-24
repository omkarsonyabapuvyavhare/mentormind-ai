"use client";

import Link from "next/link";

import { LearnerEngagementCard } from "@/components/shared/learner-engagement-card";
import { LearnerSignalTimeline } from "@/components/learning-twin/learner-signal-timeline";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { MentorInsightCard } from "@/components/shared/mentor-insight-card";
import { theme } from "@/constants/theme";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { getTopicName } from "@/lib/engine/helpers";
import { selectLearningTwinPageInsight } from "@/lib/ai/page-insights";
import { useEngagementDerivedState } from "@/hooks/use-engagement-derived-state";
import { selectLatestDecision, selectWeakTopics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function LearningTwinView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const twin = useAppStore((state) => state.twin);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const storeState = useAppStore();
  const { liveSnapshot: engagement } = useEngagementDerivedState();
  const latestDecision = selectLatestDecision(storeState);
  const weaknesses = selectWeakTopics(storeState);
  const showNewSignals = Boolean(storeState.adaptationReveal);

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized || !twin) {
    return (
      <EmptyState
        title="Your Learning Twin is not active yet"
        description="MentorMind builds a learner memory from your goal, habits, and quiz signals."
      />
    );
  }

  const insight = selectLearningTwinPageInsight(storeState);
  const latestQuiz = twin.quizHistory[twin.quizHistory.length - 1];

  return (
    <AppShell title="Learning Twin" subtitle={PAGE_QUESTIONS.learningTwin}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}

      <MentorInsightCard insight={insight} />

      {engagement ? (
        <LearnerEngagementCard
          title="Engagement"
          snapshot={engagement}
          className="border-white/10"
          streakLabel="Current streak"
          riskLabel="Risk"
        />
      ) : null}

      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Newly learned this session</p>
        <div className="mt-4 space-y-3">
          {latestQuiz ? (
            <HighlightRow
              label="Latest quiz signal"
              value={`${getTopicName(latestQuiz.topicId)} · ${latestQuiz.score}%`}
              isNew={showNewSignals}
            />
          ) : null}
          {weaknesses.map((topic) => (
            <HighlightRow
              key={topic.topicId}
              label="Weakness tracked"
              value={`${topic.topicName} · ${topic.score}%`}
              isNew={showNewSignals && (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD") ?? false)}
            />
          ))}
          {twin.strengths.map((topic) => (
            <HighlightRow
              key={topic.topicId}
              label="Strength recorded"
              value={`${topic.topicName} · ${topic.score}%`}
              isNew={showNewSignals && (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED") ?? false)}
            />
          ))}
          {!latestQuiz && weaknesses.length === 0 && twin.strengths.length === 0 ? (
            <p className="text-sm text-muted">Complete today&apos;s session to populate your twin.</p>
          ) : null}
        </div>
      </GlassCard>

      <LearnerSignalTimeline />

      <Button asChild variant="secondary">
        <Link href={routes.dashboard}>Back to Dashboard</Link>
      </Button>
    </AppShell>
  );
}

function HighlightRow({
  label,
  value,
  isNew,
}: {
  label: string;
  value: string;
  isNew: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        isNew ? `${theme.cards.adaptation} animate-reveal-in` : "border-white/10 bg-white/5"
      }`}
    >
      <div>
        <p className="text-muted">{label}</p>
        <p className="mt-1 font-medium">{value}</p>
      </div>
      {isNew ? <Badge className={theme.badges.injected}>New</Badge> : null}
    </div>
  );
}

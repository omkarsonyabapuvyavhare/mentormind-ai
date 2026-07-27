"use client";

import { AssessmentOverviewCard } from "@/components/assessment/assessment-overview-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { MentorInsightCard } from "@/components/shared/mentor-insight-card";
import { assessmentCatalog } from "@/constants/assessment";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { selectAssessmentPageInsight } from "@/lib/ai/page-insights";
import {
  selectQuizAttemptsForTopic,
  selectTopicStrength,
  selectTopicWeakness,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function AssessmentView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const storeState = useAppStore();

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Assessments unlock after setup"
        description="MentorMind uses quiz signals to understand your strengths and personalize your roadmap."
      >
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={routes.onboarding}>Create My Learning Plan</Link>
          </Button>
        </div>
      </EmptyState>
    );
  }

  const insight = selectAssessmentPageInsight(storeState);

  return (
    <AppShell title="Assessment" subtitle={PAGE_QUESTIONS.assessment}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}

      <MentorInsightCard insight={insight} />

      <p className="text-xs uppercase tracking-wide text-muted">Available assessments</p>
      <div className="grid gap-6 lg:grid-cols-2">
        {assessmentCatalog.map((topic) => {
          const attempts = selectQuizAttemptsForTopic(storeState, topic.topicId);
          const weakness = selectTopicWeakness(storeState, topic.topicId);
          const strength = selectTopicStrength(storeState, topic.topicId);
          const topicStatus = strength ? "mastery" : weakness ? "weakness" : "ready";

          return (
            <AssessmentOverviewCard
              key={topic.topicId}
              topic={topic}
              attemptCount={attempts.length}
              topicStatus={topicStatus}
            />
          );
        })}
      </div>
    </AppShell>
  );
}

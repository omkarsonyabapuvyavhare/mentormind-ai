"use client";

import Link from "next/link";
import { useEffect } from "react";

import { QuizShell } from "@/components/assessment/quiz-shell";
import { AppShell } from "@/components/layout/app-shell";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { useGeneratedAssessment } from "@/hooks/use-generated-assessment";
import { resolveTopicTitle } from "@/lib/learn/resolve-lesson-context";
import { useAppStore } from "@/stores/use-app-store";

export function GeneratedAssessmentView({ topicId }: { topicId: string }) {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const { assessment, loading, error } = useGeneratedAssessment(topicId);
  const topicTitle = resolveTopicTitle(useAppStore.getState(), topicId);
  const syncPresenterMode = useAppStore((state) => state.syncPresenterMode);

  useEffect(() => {
    syncPresenterMode(undefined, `assessment-view:${topicId}`);
  }, [syncPresenterMode, topicId]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !assessment) {
      return;
    }

    console.info("[AssessmentRender]", {
      pathname: window.location.pathname,
      topicId,
      questionCount: assessment.questions.length,
      presenterMode: useAppStore.getState().presenterMode,
      assessmentTopicId: assessment.topicId,
    });
  }, [assessment, topicId]);

  if (!isHydrated || loading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Assessment unavailable"
        description="Create your learning plan first — your mentor will guide you through lessons and check-ins."
      >
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={routes.onboarding}>Create My Learning Plan</Link>
          </Button>
        </div>
      </EmptyState>
    );
  }

  if (error || !assessment) {
    return (
      <EmptyState
        title="Assessment unavailable"
        description={error ?? "We couldn't prepare this topic check-in right now."}
      />
    );
  }

  return (
    <AppShell title="Check your understanding" subtitle={PAGE_QUESTIONS.assessment}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}
      <TutorFlowStepper current="assess" className="mb-2" />
      <Button asChild variant="ghost" size="sm" className="w-fit -mt-2">
        <Link href={routes.lesson(topicId)}>← Back to lesson</Link>
      </Button>
      <GeneratedAssessmentIntro topicTitle={topicTitle} questionCount={assessment.questions.length} />
      <QuizShell assessment={assessment} />
    </AppShell>
  );
}

function GeneratedAssessmentIntro({
  topicTitle,
  questionCount,
}: {
  topicTitle: string;
  questionCount: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-muted">
        Short check-in for <span className="font-medium text-foreground">{topicTitle}</span>. Answer{" "}
        {questionCount} questions based on the lesson you just studied.
      </p>
    </div>
  );
}

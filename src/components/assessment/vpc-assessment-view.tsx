"use client";

import Link from "next/link";

import { QuizShell } from "@/components/assessment/quiz-shell";
import { AppShell } from "@/components/layout/app-shell";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { getAssessmentTopic } from "@/constants/assessment";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import { topicQuizToAssessment } from "@/lib/assessment/seed-quiz-adapter";
import { selectTodayMission } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";

const TOPIC_ID = "vpc-networking";

/** Legacy AWS seed assessment — retained for aws-saa-c03 fast path only. */
export function VpcAssessmentView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const storeState = useAppStore();
  const mission = selectTodayMission(storeState);

  const topicMeta = getAssessmentTopic(TOPIC_ID);
  const quiz = awsSaaQuizzes[TOPIC_ID];
  const assessment = quiz ? topicQuizToAssessment(quiz) : null;

  if (!isHydrated) {
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

  if (!quiz || !topicMeta || !assessment) {
    return (
      <EmptyState
        title="Assessment unavailable"
        description="The VPC Networking quiz could not be loaded."
      />
    );
  }

  return (
    <AppShell title="Check-in" subtitle={PAGE_QUESTIONS.assessment}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}
      <TutorFlowStepper current="assess" className="mb-2" />
      <Button asChild variant="ghost" size="sm" className="w-fit -mt-2">
        <Link href={mission.lessonHref}>← Back to lesson</Link>
      </Button>
      <QuizShell assessment={assessment} />
    </AppShell>
  );
}

"use client";

import Link from "next/link";

import { AdaptationDiffBanner } from "@/components/roadmap/adaptation-diff-banner";
import { RoadmapChangesTimeline } from "@/components/roadmap/roadmap-changes-timeline";
import { RoadmapHeader } from "@/components/roadmap/roadmap-header";
import { AppShell } from "@/components/layout/app-shell";
import { StartLiveDemoButton } from "@/components/landing/start-live-demo-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { MentorInsightCard } from "@/components/shared/mentor-insight-card";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { selectRoadmapPageInsight } from "@/lib/ai/page-insights";
import { useAppStore } from "@/stores/use-app-store";

export function RoadmapView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const roadmap = useAppStore((state) => state.roadmap);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const storeState = useAppStore();

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Your plan is not ready yet"
        description="MentorMind needs a learning plan before it can explain your roadmap."
      >
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={routes.onboarding}>Create My Learning Plan</Link>
          </Button>
          <StartLiveDemoButton variant="secondary" />
        </div>
      </EmptyState>
    );
  }

  if (!roadmap) {
    return (
      <EmptyState
        title="No roadmap available"
        description="MentorMind has not generated your certification roadmap yet."
      />
    );
  }

  const insight = selectRoadmapPageInsight(storeState);

  return (
    <AppShell title="Roadmap changes" subtitle={PAGE_QUESTIONS.roadmap}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}

      <MentorInsightCard insight={insight} />
      <AdaptationDiffBanner />
      <RoadmapHeader />

      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={routes.dashboard}>← Back to Dashboard</Link>
      </Button>

      <RoadmapChangesTimeline />
    </AppShell>
  );
}

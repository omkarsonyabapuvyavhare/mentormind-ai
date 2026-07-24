"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { StartLiveDemoButton } from "@/components/landing/start-live-demo-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { routes } from "@/constants/routes";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardView() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Your AI Mentor is waiting"
        description="Create a learning plan and your mentor will guide you from day one."
      >
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={routes.onboarding}>Create My Learning Plan</Link>
          </Button>
          <StartLiveDemoButton />
        </div>
      </EmptyState>
    );
  }

  return (
    <AppShell title="Welcome" subtitle={PAGE_QUESTIONS.dashboard}>
      {lastError ? <ErrorBanner message={lastError} onDismiss={clearError} /> : null}
      <DashboardCommandCenter />
    </AppShell>
  );
}

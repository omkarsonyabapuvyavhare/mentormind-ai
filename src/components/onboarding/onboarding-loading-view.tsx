"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { MentorAnalysisOverlay } from "@/components/shared/mentor-analysis-overlay";
import { routes } from "@/constants/routes";
import {
  clearPendingOnboarding,
  fetchGeneratedRoadmap,
  readPendingOnboarding,
} from "@/lib/onboarding/fetch-generated-roadmap";
import { prefetchCurrentLesson } from "@/lib/learn/prefetch-current-lesson";
import {
  ROADMAP_GENERATION_MIN_MS,
  ROADMAP_GENERATION_OVERLAY_MS,
  ROADMAP_GENERATION_STEPS,
  ROADMAP_GENERATION_SUBTITLE,
  ROADMAP_GENERATION_TITLE,
} from "@/lib/onboarding/roadmap-generation-constants";
import { useAppStore } from "@/stores/use-app-store";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function OnboardingLoadingView() {
  const router = useRouter();
  const completeOnboardingWithRoadmap = useAppStore(
    (state) => state.completeOnboardingWithRoadmap,
  );
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    document.title = "MentorMind — Building your roadmap";
  }, []);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    void (async () => {
      const pending = readPendingOnboarding();

      if (!pending) {
        setError("Your onboarding session expired. Please start again.");
        return;
      }

      const timestamp = new Date().toISOString();
      const startedAt = Date.now();

      const [result] = await Promise.all([
        fetchGeneratedRoadmap(pending, timestamp),
        delay(ROADMAP_GENERATION_MIN_MS),
      ]);

      const remaining = ROADMAP_GENERATION_MIN_MS - (Date.now() - startedAt);

      if (remaining > 0) {
        await delay(remaining);
      }

      completeOnboardingWithRoadmap(pending.input, result.roadmap, timestamp);
      clearPendingOnboarding();
      prefetchCurrentLesson(useAppStore.getState());
      router.replace(routes.dashboard);
    })();
  }, [completeOnboardingWithRoadmap, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-sm text-amber-200">{error}</p>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            onClick={() => router.replace(routes.onboarding)}
          >
            Back to onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <MentorAnalysisOverlay
      title={ROADMAP_GENERATION_TITLE}
      subtitle={ROADMAP_GENERATION_SUBTITLE}
      steps={[...ROADMAP_GENERATION_STEPS]}
      durationMs={ROADMAP_GENERATION_OVERLAY_MS}
      onComplete={() => {
        /* Navigation happens after roadmap fetch completes. */
      }}
    />
  );
}

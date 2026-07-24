"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  MentorAnalysisOverlay,
  ONBOARDING_STEPS,
} from "@/components/shared/mentor-analysis-overlay";
import { routes } from "@/constants/routes";

export function OnboardingLoadingView() {
  const router = useRouter();

  useEffect(() => {
    document.title = "MentorMind — Analyzing your profile";
  }, []);

  return (
    <MentorAnalysisOverlay
      title="MentorMind is analyzing your learner profile..."
      subtitle="Your AI tutor is preparing today's mission and your personalized learning path."
      steps={ONBOARDING_STEPS}
      durationMs={2800}
      onComplete={() => router.replace(routes.dashboard)}
    />
  );
}

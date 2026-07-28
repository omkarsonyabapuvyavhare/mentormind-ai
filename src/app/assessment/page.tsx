"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { routes } from "@/constants/routes";
import { selectTodayMission } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";

export default function AssessmentPage() {
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const mission = useAppStore((state) => selectTodayMission(state));

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isInitialized) {
      router.replace(routes.onboarding);
      return;
    }

    if (mission.topicId) {
      router.replace(routes.assessmentTopic(mission.topicId));
      return;
    }

    router.replace(routes.dashboard);
  }, [isHydrated, isInitialized, mission.topicId, router]);

  return <LoadingSkeleton lines={6} />;
}

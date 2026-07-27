"use client";

import { LearnerEngagementPanel } from "@/components/dashboard/learner-engagement-panel";
import { DashboardLiveClock } from "@/components/dashboard/dashboard-live-clock";
import { AccountabilityPartnerCard } from "@/components/shared/accountability-partner-card";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { MentorMissionCard } from "@/components/tutor/mentor-mission-card";
import { useLessonPrefetch } from "@/hooks/use-lesson-prefetch";
import { useInactivityPartnerAction } from "@/hooks/use-inactivity-partner-action";
import { selectActiveAccountabilityPartner } from "@/lib/ai/accountability-nudge";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardCommandCenter() {
  const state = useAppStore();
  const partner = selectActiveAccountabilityPartner(state);
  const handlePartnerAction = useInactivityPartnerAction();
  useLessonPrefetch();

  return (
    <div className="space-y-6">
      <DashboardLiveClock />
      <TutorFlowStepper current="mission" />
      {partner ? <AccountabilityPartnerCard message={partner} onAction={handlePartnerAction} /> : null}
      <MentorMissionCard />
      <LearnerEngagementPanel />
    </div>
  );
}

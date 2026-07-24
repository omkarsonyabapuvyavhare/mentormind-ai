"use client";

import { useMemo } from "react";

import { shouldShowInactivityShortcut } from "@/lib/demo/session-actions";
import { shouldShowResetTimeline } from "@/lib/demo/engagement-timeline-reset";
import {
  buildTimelinePreviewFrames,
  selectEngagementSnapshot,
} from "@/lib/learner/engagement-display";
import type { AppState } from "@/stores/store-types";
import { useAppStore } from "@/stores/use-app-store";

/** Minimal store slice used by engagement selectors — kept referentially stable via useMemo. */
function useEngagementStoreSlice(): Pick<
  AppState,
  "twin" | "decisions" | "learnerEvents" | "demoMode"
> {
  const twin = useAppStore((state) => state.twin);
  const decisions = useAppStore((state) => state.decisions);
  const learnerEvents = useAppStore((state) => state.learnerEvents);
  const demoMode = useAppStore((state) => state.demoMode);

  return useMemo(
    () => ({
      twin,
      decisions,
      learnerEvents,
      demoMode,
    }),
    [twin, decisions, learnerEvents, demoMode],
  );
}

export function useEngagementDerivedState() {
  const engagementState = useEngagementStoreSlice();

  const liveSnapshot = useMemo(
    () => selectEngagementSnapshot(engagementState as AppState),
    [engagementState],
  );

  const timelineFrames = useMemo(
    () => buildTimelinePreviewFrames(engagementState as AppState),
    [engagementState],
  );

  const showTimelineControls = useAppStore(shouldShowInactivityShortcut);
  const showResetTimeline = useAppStore(shouldShowResetTimeline);

  return {
    liveSnapshot,
    timelineFrames,
    showTimelineControls,
    showResetTimeline,
  };
}

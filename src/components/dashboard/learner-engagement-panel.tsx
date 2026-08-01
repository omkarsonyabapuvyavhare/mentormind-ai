"use client";

import { useCallback, useState } from "react";
import { FastForward, RotateCcw } from "lucide-react";

import { LearnerEngagementCard } from "@/components/shared/learner-engagement-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { buildInactivityEvent } from "@/lib/demo/session-actions";
import type { TimelinePreviewFrame } from "@/lib/learner/engagement-display";
import { runEngagementTimelineAdvance } from "@/lib/learner/engagement-timeline-advance";
import { useEngagementDerivedState } from "@/hooks/use-engagement-derived-state";
import { useAppStore } from "@/stores/use-app-store";

const INACTIVITY_TIMESTAMP = "2026-07-27T18:00:00.000Z";
const FRAME_DELAY_MS = 750;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function LearnerEngagementPanel() {
  const dispatchLearnerEvent = useAppStore((store) => store.dispatchLearnerEvent);
  const captureEngagementTimelineBaseline = useAppStore(
    (store) => store.captureEngagementTimelineBaseline,
  );
  const resetEngagementTimeline = useAppStore((store) => store.resetEngagementTimeline);
  const { liveSnapshot, timelineFrames, showTimelineControls, showResetTimeline } =
    useEngagementDerivedState();
  const [previewFrame, setPreviewFrame] = useState<TimelinePreviewFrame | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const runTimeline = useCallback(async () => {
    if (isAdvancing || timelineFrames.length === 0) {
      return;
    }

    await runEngagementTimelineAdvance(
      timelineFrames,
      {
        onAdvanceStart: () => setIsAdvancing(true),
        onAdvanceEnd: () => {
          setPreviewFrame(null);
          setIsAdvancing(false);
        },
        onPreviewFrame: setPreviewFrame,
        captureBaseline: captureEngagementTimelineBaseline,
        dispatchInactivity: () =>
          dispatchLearnerEvent(buildInactivityEvent(INACTIVITY_TIMESTAMP)),
        sleep,
      },
      FRAME_DELAY_MS,
    );
  }, [
    captureEngagementTimelineBaseline,
    dispatchLearnerEvent,
    isAdvancing,
    timelineFrames,
  ]);

  const handleResetTimeline = useCallback(() => {
    setPreviewFrame(null);
    setIsAdvancing(false);
    resetEngagementTimeline();
  }, [resetEngagementTimeline]);

  if (!liveSnapshot) {
    return null;
  }

  const cardSnapshot = isAdvancing && previewFrame ? previewFrame : liveSnapshot;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <LearnerEngagementCard snapshot={cardSnapshot} animate={isAdvancing} />
        </div>

        {showTimelineControls ? (
          <GlassCard className={`${theme.cards.warning} shrink-0 lg:w-72`}>
            <Badge className={theme.badges.demo}>Fast forward</Badge>
            <p className="mt-3 text-sm font-medium">Fast Forward Timeline</p>
            <p className="mt-1 text-sm text-muted">
              Advance the learner timeline to show how MentorMind responds to disengagement.
            </p>
            <Button
              size="lg"
              disabled={isAdvancing}
              className="mt-4 w-full"
              onClick={() => void runTimeline()}
            >
              <FastForward className="h-4 w-4" />
              Fast Forward 3 Days
            </Button>
          </GlassCard>
        ) : showResetTimeline ? (
          <GlassCard className={`${theme.cards.highlight} shrink-0 lg:w-64`}>
            <Badge className={theme.badges.demo}>Demo control</Badge>
            <p className="mt-3 text-sm font-medium">Reset timeline</p>
            <p className="mt-1 text-sm text-muted">
              Undo the inactivity fast-forward and return engagement to Active without clearing demo
              progress.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              disabled={isAdvancing}
              onClick={handleResetTimeline}
            >
              <RotateCcw className="h-4 w-4" />
              Reset timeline
            </Button>
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}

import type { TimelinePreviewFrame } from "@/lib/learner/engagement-display";

export interface EngagementTimelineAdvanceHandlers {
  onPreviewFrame: (frame: TimelinePreviewFrame | null) => void;
  onAdvanceStart: () => void;
  onAdvanceEnd: () => void;
  captureBaseline: () => void;
  dispatchInactivity: () => void;
  sleep: (ms: number) => Promise<void>;
}

export async function runEngagementTimelineAdvance(
  frames: TimelinePreviewFrame[],
  handlers: EngagementTimelineAdvanceHandlers,
  frameDelayMs: number,
): Promise<void> {
  if (frames.length === 0) {
    return;
  }

  handlers.onAdvanceStart();

  for (const frame of frames) {
    handlers.onPreviewFrame(frame);
    await handlers.sleep(frameDelayMs);
  }

  handlers.captureBaseline();
  handlers.dispatchInactivity();

  handlers.onPreviewFrame(null);
  handlers.onAdvanceEnd();
}

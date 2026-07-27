"use client";

import { useMemo } from "react";

import { useClientNow } from "@/hooks/use-client-now";
import {
  resolveEngagementNow,
  type EngagementSnapshot,
  type TimelinePreviewFrame,
} from "@/lib/learner/engagement-display";
import { formatRelativeLastSeen } from "@/lib/time/format-relative-last-seen";
import type { AppState } from "@/stores/store-types";

export function useLiveLastSeenLabel({
  snapshot,
  presenterMode,
  learnerEvents,
  freeze = false,
}: {
  snapshot: EngagementSnapshot | TimelinePreviewFrame;
  presenterMode: boolean;
  learnerEvents: AppState["learnerEvents"];
  freeze?: boolean;
}): string {
  const clientNow = useClientNow();

  return useMemo(() => {
    if (freeze || !snapshot.liveLastSeen || !clientNow) {
      return snapshot.lastSeenLabel;
    }

    const referenceNow = presenterMode
      ? resolveEngagementNow(
          {
            presenterMode,
            twin: { lastActiveAt: snapshot.lastActiveAt } as AppState["twin"],
            learnerEvents,
          },
          clientNow,
        )
      : clientNow;

    return formatRelativeLastSeen(snapshot.lastActiveAt, referenceNow);
  }, [clientNow, presenterMode, freeze, learnerEvents, snapshot]);
}

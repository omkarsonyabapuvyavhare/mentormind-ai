"use client";

import { format } from "date-fns";

import { useClientNow } from "@/hooks/use-client-now";
import { formatStudyDuration } from "@/lib/time/format-relative-last-seen";
import { selectTodayStudyPresentationMinutes } from "@/lib/time/today-study-presentation";
import { useAppStore } from "@/stores/use-app-store";

export function DashboardLiveClock() {
  const now = useClientNow();
  const todayStudyMinutes = useAppStore(selectTodayStudyPresentationMinutes);

  if (!now) {
    return (
      <p className="text-sm text-muted" aria-hidden>
        &nbsp;
      </p>
    );
  }

  return (
    <p className="text-sm text-muted">
      {format(now, "EEEE, MMMM d · h:mm a")} · Today: {formatStudyDuration(todayStudyMinutes)}{" "}
      studied
    </p>
  );
}

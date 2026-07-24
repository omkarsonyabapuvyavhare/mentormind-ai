import { differenceInCalendarDays, format, parseISO } from "date-fns";

/** Presentation-only relative last-seen label for live engagement display. */
export function formatRelativeLastSeen(lastActiveAt: string, referenceNow: Date): string {
  const date = parseISO(lastActiveAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Math.max(0, referenceNow.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const dayDiff = differenceInCalendarDays(referenceNow, date);

  if (dayDiff === 0) {
    return `Today at ${format(date, "h:mm a")}`;
  }

  if (dayDiff === 1) {
    return "Yesterday";
  }

  if (dayDiff < 7) {
    return `${dayDiff} days ago`;
  }

  return format(date, "PP");
}

export function formatSessionDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatStudyDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

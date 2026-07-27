import { differenceInCalendarDays, format, parseISO } from "date-fns";

import { theme } from "@/constants/theme";
import { thresholds } from "@/constants/thresholds";
import { capScore } from "@/lib/engine/helpers";
import type { AppState } from "@/stores/store-types";
import {
  selectCurrentStreak,
  selectDropoutRisk,
  type DropoutRiskLevel,
} from "@/stores/selectors";
import type { DecisionAction } from "@/types/decisions";
import type { LearnerEvent } from "@/types/events";

export type EngagementStatus = "active" | "idle" | "inactive";

export interface EngagementSnapshot {
  status: EngagementStatus;
  lastSeenLabel: string;
  lastActiveAt: string;
  liveLastSeen: boolean;
  streakDays: number;
  streakDisplay: string;
  dropoutRisk: number;
  dropoutRiskLevel: DropoutRiskLevel;
  inactivityDays: number;
}

export interface TimelinePreviewFrame extends EngagementSnapshot {
  statusLabel: string;
}

const STATUS_META: Record<
  EngagementStatus,
  { emoji: string; label: string; dotClass: string }
> = {
  active: {
    emoji: "🟢",
    label: "Active",
    dotClass: "text-emerald-300",
  },
  idle: {
    emoji: "🟡",
    label: "Idle",
    dotClass: "text-amber-300",
  },
  inactive: {
    emoji: "🔴",
    label: "Inactive",
    dotClass: "text-red-300",
  },
};

export function getEngagementStatusMeta(status: EngagementStatus) {
  return STATUS_META[status];
}

export function resolveDropoutRiskLevel(risk: number): DropoutRiskLevel {
  if (risk <= theme.riskLevels.low) {
    return "low";
  }

  if (risk <= theme.riskLevels.medium) {
    return "medium";
  }

  return "high";
}

export function formatLastSeenLabel(lastActiveAt: string, now = new Date()): string {
  const date = parseISO(lastActiveAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const dayDiff = differenceInCalendarDays(now, date);

  if (dayDiff <= 0) {
    return `Today • ${format(date, "h:mm a")}`;
  }

  if (dayDiff === 1) {
    return `Yesterday • ${format(date, "h:mm a")}`;
  }

  if (dayDiff < 7) {
    return `${dayDiff} days ago`;
  }

  return format(date, "PP");
}

export function formatInactivityLastSeenLabel(inactivityDays: number): string {
  if (inactivityDays <= 0) {
    return "Today";
  }

  if (inactivityDays === 1) {
    return "Yesterday";
  }

  return `${inactivityDays} days ago`;
}

export function formatStreakDisplay(streakDays: number): string {
  return `${streakDays} day${streakDays === 1 ? "" : "s"}`;
}

export function selectHasInactivityEscalation(state: Pick<AppState, "decisions">): boolean {
  return state.decisions.some((decision) =>
    decision.reasons.includes("INACTIVITY_ESCALATION"),
  );
}

export function selectLatestInactivityTickEvent(
  state: Pick<AppState, "learnerEvents">,
): Extract<LearnerEvent, { type: "INACTIVITY_TICK" }> | undefined {
  for (let index = state.learnerEvents.length - 1; index >= 0; index -= 1) {
    const event = state.learnerEvents[index];
    if (event?.type === "INACTIVITY_TICK") {
      return event;
    }
  }

  return undefined;
}

/** Demo uses scripted event time, not wall clock, so engagement does not drift to Inactive on load. */
export function resolveEngagementNow(
  state: Pick<AppState, "presenterMode" | "twin" | "learnerEvents">,
  now = new Date(),
): Date {
  if (!state.presenterMode || !state.twin) {
    return now;
  }

  if (state.learnerEvents.length === 0) {
    return parseISO(state.twin.lastActiveAt);
  }

  const latestEvent = state.learnerEvents[state.learnerEvents.length - 1];
  if (latestEvent) {
    return parseISO(latestEvent.timestamp);
  }

  return parseISO(state.twin.lastActiveAt);
}

/** Single canonical day count shared by status, last seen, and preview frames. */
export function selectEffectiveInactivityDays(
  state: Pick<AppState, "twin" | "decisions" | "learnerEvents" | "presenterMode">,
  now = new Date(),
): number {
  const twin = state.twin;

  if (!twin) {
    return 0;
  }

  const engagementNow = resolveEngagementNow(state, now);
  const calendarDays = Math.max(
    0,
    differenceInCalendarDays(engagementNow, parseISO(twin.lastActiveAt)),
  );
  const tickDays = selectLatestInactivityTickEvent(state)?.days ?? 0;
  const escalationFloor = selectHasInactivityEscalation(state)
    ? Math.max(tickDays, thresholds.inactivityTriggerDays)
    : 0;

  return Math.max(twin.inactivityDays, calendarDays, escalationFloor);
}

export function selectEngagementStatus(
  state: Pick<AppState, "twin" | "decisions" | "learnerEvents" | "presenterMode">,
  now = new Date(),
): EngagementStatus {
  const twin = state.twin;

  if (!twin) {
    return "active";
  }

  const effectiveDays = selectEffectiveInactivityDays(state, now);

  if (effectiveDays >= thresholds.inactivityTriggerDays) {
    return "inactive";
  }

  if (effectiveDays >= 1 || twin.inactivityDays >= 1) {
    return "idle";
  }

  return "active";
}

function findLatestInactivityEscalationDecision(state: Pick<AppState, "decisions">) {
  for (let index = state.decisions.length - 1; index >= 0; index -= 1) {
    const decision = state.decisions[index];
    if (decision?.reasons.includes("INACTIVITY_ESCALATION")) {
      return decision;
    }
  }

  return undefined;
}

/** Prefer engine-recorded risk from the inactivity decision when twin state is stale. */
export function selectCanonicalDropoutRisk(
  state: Pick<AppState, "twin" | "decisions">,
  effectiveDays = 0,
): number {
  const inactivityDecision = findLatestInactivityEscalationDecision(state);
  const baseRisk = selectDropoutRisk(state);

  if (inactivityDecision) {
    const action = inactivityDecision.actions.find(
      (entry): entry is Extract<DecisionAction, { action: "UPDATE_DROPOUT_RISK" }> =>
        entry.action === "UPDATE_DROPOUT_RISK",
    );

    if (action) {
      return action.dropoutRisk;
    }

    const twin = state.twin;
    if (twin && twin.inactivityDays >= thresholds.inactivityTriggerDays) {
      return twin.dropoutRisk;
    }

    return capScore(baseRisk + thresholds.dropoutRiskIncreaseOnInactivity);
  }

  if (effectiveDays >= thresholds.inactivityTriggerDays) {
    return capScore(baseRisk + thresholds.dropoutRiskIncreaseOnInactivity);
  }

  return baseRisk;
}

export function selectEngagementStreakPresentation(
  state: Pick<AppState, "twin">,
  status: EngagementStatus,
): Pick<EngagementSnapshot, "streakDays" | "streakDisplay"> {
  if (status === "inactive") {
    return {
      streakDays: 0,
      streakDisplay: "Streak paused",
    };
  }

  const streakDays = selectCurrentStreak(state);

  return {
    streakDays,
    streakDisplay: formatStreakDisplay(streakDays),
  };
}

function selectEngagementLastSeenLabel(
  state: Pick<AppState, "twin" | "decisions" | "learnerEvents" | "presenterMode">,
  status: EngagementStatus,
  effectiveDays: number,
  now = new Date(),
): string {
  const twin = state.twin!;
  const engagementNow = resolveEngagementNow(state, now);

  if (status === "active") {
    return formatLastSeenLabel(twin.lastActiveAt, engagementNow);
  }

  if (status === "idle") {
    if (effectiveDays === 1) {
      return `Yesterday • ${format(parseISO(twin.lastActiveAt), "h:mm a")}`;
    }

    return formatInactivityLastSeenLabel(effectiveDays);
  }

  return formatInactivityLastSeenLabel(effectiveDays);
}

export function selectEngagementSnapshot(
  state: Pick<AppState, "twin" | "decisions" | "learnerEvents" | "presenterMode">,
  now = new Date(),
): EngagementSnapshot | null {
  const twin = state.twin;

  if (!twin) {
    return null;
  }

  const status = selectEngagementStatus(state, now);
  const effectiveDays = selectEffectiveInactivityDays(state, now);
  const dropoutRisk = selectCanonicalDropoutRisk(state, effectiveDays);
  const streak = selectEngagementStreakPresentation(state, status);
  const lastSeenLabel = selectEngagementLastSeenLabel(state, status, effectiveDays, now);

  return {
    status,
    lastSeenLabel,
    lastActiveAt: twin.lastActiveAt,
    liveLastSeen: status === "active",
    streakDays: streak.streakDays,
    streakDisplay: streak.streakDisplay,
    dropoutRisk,
    dropoutRiskLevel: resolveDropoutRiskLevel(dropoutRisk),
    inactivityDays: effectiveDays,
  };
}

export function buildTimelinePreviewFrames(
  state: Pick<AppState, "twin" | "decisions" | "learnerEvents" | "presenterMode">,
): TimelinePreviewFrame[] {
  const snapshot = selectEngagementSnapshot(state);

  if (!snapshot) {
    return [];
  }

  const baseRisk = snapshot.dropoutRisk;
  const midRisk = capScore(baseRisk + thresholds.dropoutRiskIncreaseOnInactivity / 2);
  const inactiveRisk = capScore(baseRisk + thresholds.dropoutRiskIncreaseOnInactivity);
  const baseTime = format(parseISO(state.twin!.lastActiveAt), "h:mm a");
  const idleStreakDays = Math.max(snapshot.streakDays - 1, 0);

  return [
    {
      status: "active",
      statusLabel: STATUS_META.active.label,
      lastSeenLabel: formatLastSeenLabel(state.twin!.lastActiveAt, resolveEngagementNow(state)),
      lastActiveAt: state.twin!.lastActiveAt,
      liveLastSeen: false,
      streakDays: snapshot.streakDays,
      streakDisplay: formatStreakDisplay(snapshot.streakDays),
      dropoutRisk: baseRisk,
      dropoutRiskLevel: resolveDropoutRiskLevel(baseRisk),
      inactivityDays: 0,
    },
    {
      status: "idle",
      statusLabel: STATUS_META.idle.label,
      lastSeenLabel: `Yesterday • ${baseTime}`,
      lastActiveAt: state.twin!.lastActiveAt,
      liveLastSeen: false,
      streakDays: idleStreakDays,
      streakDisplay: formatStreakDisplay(idleStreakDays),
      dropoutRisk: midRisk,
      dropoutRiskLevel: resolveDropoutRiskLevel(midRisk),
      inactivityDays: 1,
    },
    {
      status: "inactive",
      statusLabel: STATUS_META.inactive.label,
      lastSeenLabel: formatInactivityLastSeenLabel(thresholds.inactivityTriggerDays),
      lastActiveAt: state.twin!.lastActiveAt,
      liveLastSeen: false,
      streakDays: 0,
      streakDisplay: "Streak paused",
      dropoutRisk: inactiveRisk,
      dropoutRiskLevel: resolveDropoutRiskLevel(inactiveRisk),
      inactivityDays: thresholds.inactivityTriggerDays,
    },
  ];
}

export function formatDropoutRiskLabel(level: DropoutRiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

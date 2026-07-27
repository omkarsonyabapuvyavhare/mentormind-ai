import { formatTopicTitle } from "@/lib/format/topic-title";
import { findNextPendingTask, getTopicName } from "@/lib/engine/helpers";
import type { EngineContext } from "@/types/decisions";
import type { LearnerEventPayload } from "@/types/events";

export interface InactivityNudgeContent {
  title: string;
  body: string;
  topicName: string;
  recoveryTopicId: string;
  recoveryTaskTitle: string;
  upcomingTopicName: string | null;
  goalTitle: string;
  inactivityDays: number;
  shortenedMinutes?: number;
  weakTopicScore?: number;
}

type InactivityEvent = Extract<LearnerEventPayload, { type: "INACTIVITY_TICK" }>;

function resolveWeakTopic(context: EngineContext) {
  const sorted = [...context.twin.weaknesses].sort((a, b) => a.score - b.score);
  if (sorted[0]) {
    return {
      topicId: sorted[0].topicId,
      topicName: sorted[0].topicName,
      score: sorted[0].score,
    };
  }

  const challenge = context.twin.knownChallenges[0];
  if (challenge) {
    return {
      topicId: challenge.topicId,
      topicName: challenge.topicName,
    };
  }

  return null;
}

function resolveUpcomingTopicName(context: EngineContext, recoveryTopicId: string): string | null {
  const milestoneOrder = new Map(
    context.roadmap.milestones.map((milestone) => [milestone.id, milestone.order]),
  );

  const pendingTasks = [...context.roadmap.tasks]
    .filter((task) => task.status === "pending" && task.unlocked)
    .sort((a, b) => {
      const orderDiff =
        (milestoneOrder.get(a.milestoneId) ?? 0) - (milestoneOrder.get(b.milestoneId) ?? 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return a.priority - b.priority;
    });

  const recoveryIndex = pendingTasks.findIndex((task) => task.topicId === recoveryTopicId);
  const afterRecovery = pendingTasks[recoveryIndex + 1];
  if (afterRecovery && afterRecovery.topicId !== recoveryTopicId) {
    return afterRecovery.title || getTopicName(afterRecovery.topicId);
  }

  const nextMilestone = context.roadmap.milestones
    .filter((milestone) => milestone.status !== "completed")
    .sort((a, b) => a.order - b.order)[1];

  const upcomingTopicId = nextMilestone?.topicIds[0];
  const upcomingTask = pendingTasks.find((task) => task.topicId === upcomingTopicId);
  if (upcomingTask) {
    return upcomingTask.title || getTopicName(upcomingTask.topicId);
  }

  return upcomingTopicId ? getTopicName(upcomingTopicId) : null;
}

function formatDayLabel(days: number): string {
  if (days === 1) {
    return "one day";
  }
  if (days === 3) {
    return "three days";
  }
  return `${days} days`;
}

function buildOpeningLine(event: InactivityEvent, context: EngineContext): string {
  const dayLabel = formatDayLabel(event.days);
  const hadStreak = context.twin.currentStreakDays > 0 || context.twin.quizHistory.length > 0;

  if (event.days >= 3 && hadStreak) {
    return `You've missed ${dayLabel === "three days" ? "three study sessions" : `${event.days} study sessions`}.`;
  }

  if (event.days >= 3) {
    return `You've been away for ${dayLabel}.`;
  }

  return `You haven't studied in ${dayLabel}.`;
}

function buildProgressLine(
  weak: ReturnType<typeof resolveWeakTopic>,
  topicName: string,
  recoveryTaskTitle: string,
): string {
  if (weak?.score !== undefined) {
    return `Your recent assessment shows ${topicName} still needs work.`;
  }

  if (weak) {
    return `Your biggest gap is ${topicName}.`;
  }

  return `You were making good progress on ${recoveryTaskTitle}.`;
}

function buildRecoveryLine(
  topicName: string,
  upcomingTopicName: string | null,
  shortenedMinutes?: number,
): string {
  const minutes =
    shortenedMinutes ??
    undefined;

  if (upcomingTopicName && minutes) {
    return `Before moving to ${upcomingTopicName}, let's spend ${minutes} minutes refreshing ${topicName.toLowerCase()}.`;
  }

  if (upcomingTopicName) {
    return `Let's review ${topicName} before continuing to ${upcomingTopicName}.`;
  }

  if (minutes) {
    return `Let's spend ${minutes} minutes on a focused ${topicName} session to get back on track.`;
  }

  return `Let's reinforce ${topicName} before moving forward.`;
}

function buildTitle(goalTitle: string, goalType: "Skill" | "Certification"): string {
  if (goalType === "Certification") {
    const examMatch = goalTitle.match(/\(([^)]+)\)/);
    if (examMatch) {
      return `Stay on track with your ${examMatch[1]} goal`;
    }
    return "Stay on track with your certification goal";
  }

  const skillLabel = goalTitle.length > 48 ? formatTopicTitle(goalTitle.split(" ")[0] ?? "learning") : goalTitle;
  return `Stay on track with ${skillLabel}`;
}

export function buildInactivityNudgeContent(
  event: InactivityEvent,
  context: EngineContext,
  shortenedMinutes?: number,
): InactivityNudgeContent {
  const goalTitle = context.twin.goal.title;
  const weak = resolveWeakTopic(context);
  const nextTask = findNextPendingTask(context.roadmap);

  const recoveryTopicId = weak?.topicId ?? nextTask?.topicId ?? "";
  const topicName =
    weak?.topicName ??
    (nextTask ? getTopicName(nextTask.topicId) : formatTopicTitle(recoveryTopicId || "focus"));
  const recoveryTaskTitle = nextTask?.title ?? topicName;
  const upcomingTopicName = recoveryTopicId
    ? resolveUpcomingTopicName(context, recoveryTopicId)
    : null;

  const opening = buildOpeningLine(event, context);
  const progress = buildProgressLine(weak, topicName, recoveryTaskTitle);
  const recovery = buildRecoveryLine(topicName, upcomingTopicName, shortenedMinutes);
  const body = `${opening} ${progress} ${recovery}`;

  return {
    title: buildTitle(goalTitle, context.twin.goal.type),
    body,
    topicName,
    recoveryTopicId,
    recoveryTaskTitle,
    upcomingTopicName,
    goalTitle,
    inactivityDays: event.days,
    shortenedMinutes,
    weakTopicScore: weak?.score,
  };
}

export function buildInactivityExpectedBenefit(topicName: string): string {
  return `Rebuild confidence in ${topicName} before moving forward.`;
}

import type { LearnerEventPayload } from "@/types/events";
import type { ReasonCode } from "@/types/decisions";

export interface ExplanationContext {
  topicName?: string;
  score?: number;
  inactivityDays?: number;
  revisionCount?: number;
  labCount?: number;
  daysDelta?: number;
  shortenedMinutes?: number;
  advancedTaskUnlocked?: boolean;
}

function buildQuizFailureExplanation(context: ExplanationContext): string {
  const topic = context.topicName ?? "this topic";
  const score = context.score ?? 0;
  const revisions = context.revisionCount ?? 2;
  const labs = context.labCount ?? 1;
  const days = context.daysDelta ?? 3;

  const revisionLabel = revisions === 2 ? "two revision sessions" : `${revisions} revision sessions`;
  const labLabel = labs === 1 ? "one practical lab" : `${labs} practical labs`;
  const dayLabel = days === 3 ? "three days" : `${days} days`;

  return `You scored ${score}% in ${topic}, below the mastery threshold. I added ${revisionLabel} and ${labLabel}, and shifted the next milestone by ${dayLabel} so you can strengthen this prerequisite before progressing.`;
}

function buildInactivityExplanation(context: ExplanationContext): string {
  const days = context.inactivityDays ?? 3;
  const dayLabel = days === 3 ? "three days" : `${days} days`;

  return `You've been inactive for ${dayLabel}. To keep your AWS certification plan achievable, I shortened your next session and selected a focused VPC revision task.`;
}

function buildMasteryExplanation(context: ExplanationContext): string {
  const topic = context.topicName ?? "this topic";
  const score = context.score ?? 0;
  const days = context.daysDelta ?? 2;
  const dayLabel = days === 2 ? "two days" : `${days} days`;

  return `You scored ${score}% in ${topic} and demonstrated mastery. I removed the remaining revision work, unlocked an advanced architecture task, and accelerated your roadmap by ${dayLabel}.`;
}

export function buildExplanation(
  reasons: ReasonCode[],
  context: ExplanationContext = {},
  event?: LearnerEventPayload,
): string {
  if (reasons.length === 0) {
    return "No adaptation was required for this event.";
  }

  if (reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return buildMasteryExplanation(context);
  }

  if (reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return buildQuizFailureExplanation(context);
  }

  if (reasons.includes("INACTIVITY_ESCALATION")) {
    return buildInactivityExplanation(context);
  }

  if (event?.type === "QUIZ_COMPLETED" && context.score !== undefined) {
    return `You scored ${context.score}% in ${context.topicName ?? "this topic"}. No roadmap changes were needed at this time.`;
  }

  return "Your learning plan was reviewed and updated based on your latest activity.";
}

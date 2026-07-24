import { addDays, parseISO } from "date-fns";

import type { LearnerEventPayload } from "@/types/events";
import type { LearningTask, Milestone, Roadmap } from "@/types/roadmap";
import type { Nudge } from "@/types/nudge";

type QuizCompletedPayload = Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }>;
type InactivityPayload = Extract<LearnerEventPayload, { type: "INACTIVITY_TICK" }>;

export function capScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function addDaysToIso(isoDate: string, days: number): string {
  return addDays(parseISO(isoDate), days).toISOString();
}

export function createQuizDecisionId(event: QuizCompletedPayload): string {
  return `decision-quiz-${event.topicId}-${event.score}-${event.timestamp}`;
}

export function createInactivityDecisionId(event: InactivityPayload): string {
  return `decision-inactivity-${event.days}-${event.timestamp}`;
}

export function createQuizAttemptId(event: QuizCompletedPayload): string {
  return `quiz-${event.topicId}-${event.score}-${event.timestamp}`;
}

export function createRevisionTaskId(
  topicId: string,
  index: number,
  decisionId: string,
): string {
  return `task-revision-${topicId}-${index}-${decisionId}`;
}

export function createLabTaskId(topicId: string, decisionId: string): string {
  return `task-lab-${topicId}-${decisionId}`;
}

export function createNudgeId(event: InactivityPayload): string {
  return `nudge-inactivity-${event.days}-${event.timestamp}`;
}

export function findMilestoneForTopic(
  roadmap: Roadmap,
  topicId: string,
): Milestone | undefined {
  return roadmap.milestones.find((milestone) => milestone.topicIds.includes(topicId));
}

export function findNextDependentMilestone(
  roadmap: Roadmap,
  topicId: string,
): Milestone | undefined {
  const current = findMilestoneForTopic(roadmap, topicId);
  if (!current) {
    return undefined;
  }

  return roadmap.milestones
    .filter((milestone) => milestone.order > current.order)
    .sort((a, b) => a.order - b.order)[0];
}

export function findNextPendingTask(roadmap: Roadmap): LearningTask | undefined {
  const milestoneOrder = new Map(
    roadmap.milestones.map((milestone) => [milestone.id, milestone.order]),
  );

  return [...roadmap.tasks]
    .filter((task) => task.status === "pending" && task.unlocked)
    .sort((a, b) => {
      const orderDiff =
        (milestoneOrder.get(a.milestoneId) ?? 0) - (milestoneOrder.get(b.milestoneId) ?? 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return a.priority - b.priority;
    })[0];
}

export function hasInjectedTasksForDecision(
  roadmap: Roadmap,
  decisionId: string,
): boolean {
  return roadmap.tasks.some((task) => task.injectedBy === decisionId);
}

export function hasQuizAttempt(
  quizHistory: { id: string }[],
  attemptId: string,
): boolean {
  return quizHistory.some((attempt) => attempt.id === attemptId);
}

export function hasNudgeWithId(nudges: Nudge[] | undefined, nudgeId: string): boolean {
  return (nudges ?? []).some((nudge) => nudge.id === nudgeId);
}

export function getTopicName(topicId: string): string {
  const names: Record<string, string> = {
    "cloud-foundations": "Cloud Foundations",
    "iam-security": "IAM and Security",
    "ec2-compute": "EC2 and Compute",
    "vpc-networking": "VPC Networking",
    "s3-storage": "S3 and Storage",
    databases: "Databases",
    "high-availability": "High Availability",
    "exam-prep": "Exam Preparation",
  };

  return names[topicId] ?? topicId;
}

export function nextRoadmapVersion(roadmap: Roadmap): number {
  return roadmap.version + 1;
}

export function shortenTaskDuration(
  minutes: number,
  factor: number,
  minimum: number,
): number {
  return Math.max(minimum, Math.round(minutes * factor));
}

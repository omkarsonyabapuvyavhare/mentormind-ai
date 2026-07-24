import { addDays, addWeeks, parseISO } from "date-fns";

import { demo as demoConstants } from "@/constants/demo";
import {
  awsSaaGoal,
  awsSaaMilestoneSeeds,
  awsSaaTaskSeeds,
} from "@/data/aws-saa-seed";
import {
  demoInitialCompletedTaskIds,
  demoInitialCurrentMilestoneId,
  demoInitialStrengths,
} from "@/data/demo-initial-state";
import type { LearningTwin, Roadmap } from "@/types";

export interface GenerateInitialRoadmapInput {
  twinId: string;
  startTimestamp: string;
}

function toIso(date: Date): string {
  return date.toISOString();
}

export function createInitialTwin(input: GenerateInitialRoadmapInput): LearningTwin {
  const startDate = parseISO(input.startTimestamp);
  const targetDate = addWeeks(startDate, awsSaaGoal.durationWeeks);

  return {
    id: input.twinId,
    goal: {
      title: awsSaaGoal.title,
      targetDate: toIso(targetDate),
      examCode: awsSaaGoal.examCode,
    },
    skillLevel: demoConstants.defaultSkillLevel,
    strengths: [],
    weaknesses: [],
    knownChallenges: [],
    preferences: {
      studyTimeOfDay: demoConstants.defaultStudyTimeOfDay,
      focusDurationMinutes: demoConstants.defaultFocusDurationMinutes,
      preferredFormats: ["video", "lab", "quiz"],
    },
    consistencyScore: 100,
    quizHistory: [],
    lastActiveAt: input.startTimestamp,
    inactivityDays: 0,
    currentStreakDays: 0,
    totalStudyMinutes: 0,
    plannedStudyMinutes: 0,
    dropoutRisk: 10,
    learningVelocity: 0,
    createdAt: input.startTimestamp,
    updatedAt: input.startTimestamp,
  };
}

/** Fixed demo learner id for predictable seeds and verification. */
export const demoLearnerId = "learner-demo-001";

export function createDemoTwin(startTimestamp: string): LearningTwin {
  const startDate = parseISO(startTimestamp);
  const targetDate = addWeeks(startDate, awsSaaGoal.durationWeeks);

  return {
    id: demoLearnerId,
    goal: {
      title: awsSaaGoal.title,
      targetDate: toIso(targetDate),
      examCode: awsSaaGoal.examCode,
    },
    skillLevel: demoConstants.defaultSkillLevel,
    strengths: demoInitialStrengths.map((strength) => ({
      ...strength,
      lastAssessedAt: startTimestamp,
    })),
    weaknesses: [],
    knownChallenges: [],
    preferences: {
      studyTimeOfDay: demoConstants.defaultStudyTimeOfDay,
      focusDurationMinutes: demoConstants.defaultFocusDurationMinutes,
      preferredFormats: ["video", "lab", "quiz"],
    },
    consistencyScore: demoConstants.initialConsistencyScore,
    quizHistory: [],
    lastActiveAt: startTimestamp,
    inactivityDays: 0,
    currentStreakDays: demoConstants.initialStreakDays,
    totalStudyMinutes: demoConstants.initialStudyMinutes,
    plannedStudyMinutes: demoConstants.initialPlannedMinutes,
    dropoutRisk: demoConstants.initialDropoutRisk,
    learningVelocity: demoConstants.initialLearningVelocity,
    createdAt: startTimestamp,
    updatedAt: startTimestamp,
  };
}

export function generateInitialRoadmap(input: GenerateInitialRoadmapInput): Roadmap {
  const startDate = parseISO(input.startTimestamp);

  const milestones = awsSaaMilestoneSeeds.map((seed) => ({
    id: seed.id,
    title: seed.title,
    targetDate: toIso(addWeeks(startDate, seed.week)),
    status: seed.week === 1 ? ("current" as const) : ("upcoming" as const),
    topicIds: seed.topicIds,
    order: seed.week,
  }));

  const milestoneWeekById = new Map(
    awsSaaMilestoneSeeds.map((seed) => [seed.id, seed.week]),
  );

  const tasks = awsSaaTaskSeeds.map((seed) => ({
    id: seed.id,
    milestoneId: seed.milestoneId,
    topicId: seed.topicId,
    type: seed.type,
    title: seed.title,
    estimatedMinutes: seed.estimatedMinutes,
    status: "pending" as const,
    priority: seed.priority,
    unlocked: (milestoneWeekById.get(seed.milestoneId) ?? 99) <= 4,
  }));

  return {
    id: `roadmap-${input.twinId}`,
    goalId: input.twinId,
    milestones,
    tasks,
    version: 1,
    updatedAt: input.startTimestamp,
  };
}

function applyDemoDashboardProgress(roadmap: Roadmap, startTimestamp: string): Roadmap {
  const completedSet = new Set<string>(demoInitialCompletedTaskIds);

  const tasks = roadmap.tasks.map((task) => ({
    ...task,
    status: completedSet.has(task.id) ? ("completed" as const) : task.status,
  }));

  const currentWeek = awsSaaMilestoneSeeds.find(
    (seed) => seed.id === demoInitialCurrentMilestoneId,
  )?.week;

  const milestones = roadmap.milestones.map((milestone) => {
    if (milestone.id === demoInitialCurrentMilestoneId) {
      return { ...milestone, status: "current" as const };
    }

    if (currentWeek && milestone.order < currentWeek) {
      return { ...milestone, status: "completed" as const };
    }

    return { ...milestone, status: "upcoming" as const };
  });

  const unlockedMilestoneIds = new Set(
    milestones
      .filter((milestone) => milestone.status === "current" || milestone.status === "completed")
      .map((milestone) => milestone.id),
  );

  return {
    ...roadmap,
    milestones,
    tasks: tasks.map((task) => ({
      ...task,
      unlocked: unlockedMilestoneIds.has(task.milestoneId),
    })),
    version: demoConstants.initialRoadmapVersion,
    updatedAt: startTimestamp,
  };
}

export function generateDemoRoadmap(startTimestamp: string): Roadmap {
  const base = generateInitialRoadmap({
    twinId: demoLearnerId,
    startTimestamp,
  });

  return applyDemoDashboardProgress(base, startTimestamp);
}

/** Shifts a milestone target date by a delta — used when applying engine decisions. */
export function shiftMilestoneDate(isoDate: string, daysDelta: number): string {
  return toIso(addDays(parseISO(isoDate), daysDelta));
}

import { addWeeks, parseISO } from "date-fns";

import { onboardingGoalTemplates } from "@/constants/onboarding";
import { awsSaaTopics } from "@/data/aws-saa-seed";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import {
  generateInitialRoadmap,
  type GenerateInitialRoadmapInput,
} from "@/lib/roadmap/generate-initial";
import type { KnownChallenge, LearningTwin } from "@/types/learning-twin";
import type { Roadmap } from "@/types/roadmap";

function toIso(date: Date): string {
  return date.toISOString();
}

function createLearnerId(timestamp: string): string {
  return `learner-${timestamp.replace(/[^\d]/g, "").slice(0, 14)}`;
}

function resolveKnownChallenges(topicIds: string[]): KnownChallenge[] {
  return topicIds.map((topicId) => {
    const topic = awsSaaTopics.find((entry) => entry.id === topicId);
    return {
      topicId,
      topicName: topic?.name ?? topicId,
    };
  });
}

function resolveGoalTemplate(goalId: OnboardingInput["goalId"]) {
  const template = onboardingGoalTemplates.find((goal) => goal.id === goalId);
  if (!template) {
    throw new Error(`Unsupported goal: ${goalId}`);
  }
  return template;
}

export function createTwinFromOnboarding(
  input: OnboardingInput,
  timestamp: string,
): LearningTwin {
  const template = resolveGoalTemplate(input.goalId);
  const startDate = parseISO(timestamp);
  const targetDate = addWeeks(startDate, input.durationWeeks);
  const plannedStudyMinutes = Math.round(input.studyHoursPerWeek * 60 * input.durationWeeks);

  return {
    id: createLearnerId(timestamp),
    goal: {
      title: `${template.title} in ${input.durationWeeks} weeks`,
      targetDate: toIso(targetDate),
      examCode: "examCode" in template ? template.examCode : undefined,
    },
    skillLevel: input.skillLevel,
    strengths: [],
    weaknesses: [],
    knownChallenges: resolveKnownChallenges(input.knownChallengeTopicIds),
    preferences: {
      studyTimeOfDay: input.studyTimeOfDay,
      focusDurationMinutes: input.focusDurationMinutes,
      preferredFormats: input.preferredFormats,
    },
    consistencyScore: 100,
    quizHistory: [],
    lastActiveAt: timestamp,
    inactivityDays: 0,
    currentStreakDays: 0,
    totalStudyMinutes: 0,
    plannedStudyMinutes,
    dropoutRisk: 10,
    learningVelocity: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createRoadmapFromOnboarding(
  input: OnboardingInput,
  twinId: string,
  timestamp: string,
): Roadmap {
  const template = resolveGoalTemplate(input.goalId);
  const roadmapInput: GenerateInitialRoadmapInput = {
    twinId,
    startTimestamp: timestamp,
  };

  const roadmap = generateInitialRoadmap(roadmapInput);

  if (template.id !== "aws-saa-c03") {
    return {
      ...roadmap,
      milestones: roadmap.milestones.slice(0, Math.min(input.durationWeeks, 4)),
    };
  }

  return roadmap;
}

export interface OnboardingIntentSummary {
  goal: string;
  outcome: string;
  currentLevel: string;
  timeline: string;
  availability: string;
  preferences: string;
  knownChallenge: string;
}

function formatPreferences(input: OnboardingInput): string {
  const formatLabels: Record<string, string> = {
    video: "visual content",
    reading: "reading",
    lab: "practical labs",
    quiz: "quizzes",
  };

  return input.preferredFormats.map((format) => formatLabels[format] ?? format).join(" + ");
}

export function buildIntentSummary(input: OnboardingInput): OnboardingIntentSummary {
  const template = resolveGoalTemplate(input.goalId);
  const challenges = resolveKnownChallenges(input.knownChallengeTopicIds);

  return {
    goal: template.shortTitle,
    outcome: template.outcome,
    currentLevel: input.skillLevel.charAt(0).toUpperCase() + input.skillLevel.slice(1),
    timeline: `${input.durationWeeks} weeks`,
    availability: `${input.studyHoursPerWeek * input.durationWeeks} planned hours`,
    preferences: formatPreferences(input),
    knownChallenge: challenges[0]?.topicName ?? "None selected",
  };
}

export function isSupportedOnboardingGoal(goalId: OnboardingInput["goalId"]): boolean {
  return onboardingGoalTemplates.find((goal) => goal.id === goalId)?.supported ?? false;
}

import { addWeeks, parseISO } from "date-fns";



import { awsSaaGoal } from "@/data/aws-saa-seed";
import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";

import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";

import type { OnboardingInput } from "@/lib/onboarding/schema";

import { formatTopicTitle } from "@/lib/format/topic-title";

import type { KnownChallenge, LearningTwin } from "@/types/learning-twin";

import type { Roadmap } from "@/types/roadmap";



function toIso(date: Date): string {

  return date.toISOString();

}



function createLearnerId(timestamp: string): string {

  return `learner-${timestamp.replace(/[^\d]/g, "").slice(0, 14)}`;

}



function resolveKnownChallenges(topicIds: string[]): KnownChallenge[] {
  return topicIds.map((topicId) => ({
    topicId,
    topicName: formatTopicTitle(topicId),
  }));
}



export function createTwinFromOnboarding(

  input: OnboardingInput,

  timestamp: string,

): LearningTwin {

  const startDate = parseISO(timestamp);

  const targetDate = addWeeks(startDate, input.durationWeeks);

  const plannedStudyMinutes = Math.round(input.studyHoursPerWeek * 60 * input.durationWeeks);



  return {

    id: createLearnerId(timestamp),

    goal: {

      title: `${input.goalTitle} in ${input.durationWeeks} weeks`,

      targetDate: toIso(targetDate),

      examCode: resolveExamCode(input),

      slug: input.goalSlug,

      category: input.goalCategory,

      type: input.goalType,

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



function extractExamCode(goalTitle: string): string | undefined {
  const match = goalTitle.match(/\b([A-Z]{2,}-\d{3,}|SAA-C03|AZ-900|CKA|CKAD)\b/i);
  return match?.[1]?.toUpperCase();
}

function resolveExamCode(input: OnboardingInput): string | undefined {
  if (input.goalType !== "Certification") {
    return undefined;
  }

  if (isAwsCertificationGoal(input.goalSlug)) {
    return awsSaaGoal.examCode;
  }

  return extractExamCode(input.goalTitle);
}



export function createRoadmapFromOnboarding(

  input: OnboardingInput,

  twinId: string,

  timestamp: string,

  context?: RoadmapGenerationContext,

): Roadmap {

  return createDeterministicRoadmapFromOnboarding(input, twinId, timestamp, context).roadmap;

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

  const challenges = resolveKnownChallenges(input.knownChallengeTopicIds);



  return {

    goal: input.goalTitle,

    outcome:

      input.goalType === "Certification"

        ? "Certification readiness"

        : "Structured skill development",

    currentLevel: input.skillLevel.charAt(0).toUpperCase() + input.skillLevel.slice(1),

    timeline: `${input.durationWeeks} weeks`,

    availability: `${input.studyHoursPerWeek * input.durationWeeks} planned hours`,

    preferences: formatPreferences(input),

    knownChallenge: challenges[0]?.topicName ?? "None selected",

  };

}



export function isSupportedOnboardingGoal(input: OnboardingInput): boolean {

  return isAwsCertificationGoal(input.goalSlug) || input.goalType === "Skill" || input.goalType === "Certification";

}



import { describe, expect, it } from "vitest";

import {
  selectAssessmentReasoningSummary,
  selectEnrichedNudgeContext,
  selectGoalAwareAdaptation,
  selectLearnerGoalLabel,
  withGoalReference,
} from "@/lib/ai/reasoning-summary";
import type { AppState } from "@/stores/store-types";
import type { Nudge } from "@/types/nudge";

const goalTitle = "Pass AWS Solutions Architect Associate (SAA-C03) in 8 weeks";

function baseState(): AppState {
  return {
    twin: {
      id: "twin-1",
      goal: { title: goalTitle, targetDate: "2026-09-01", examCode: "SAA-C03" },
      skillLevel: "intermediate",
      strengths: [],
      weaknesses: [{ topicId: "vpc-networking", topicName: "VPC Networking", score: 42, lastAssessedAt: "2026-07-18" }],
      knownChallenges: [{ topicId: "vpc-networking", topicName: "VPC Networking" }],
      preferences: {
        studyTimeOfDay: "evening",
        focusDurationMinutes: 45,
        preferredFormats: ["quiz"],
      },
      consistencyScore: 70,
      quizHistory: [],
      lastActiveAt: "2026-07-15",
      inactivityDays: 3,
      currentStreakDays: 0,
      totalStudyMinutes: 120,
      plannedStudyMinutes: 240,
      dropoutRisk: 35,
      learningVelocity: 1,
      createdAt: "2026-07-01",
      updatedAt: "2026-07-18",
    },
    roadmap: null,
    decisions: [],
    nudges: [],
    learnerEvents: [],
    isInitialized: true,
    isHydrated: true,
    demoMode: false,
    demoStepIndex: 0,
    flowCheckpoint: null,
    adaptationReveal: null,
    mentorAutoExplain: false,
    returnWelcomeMessage: null,
    engagementTimelineBaseline: null,
    lastError: null,
  };
}

describe("reasoning-summary", () => {
  it("references learner goal in withGoalReference", () => {
    expect(withGoalReference("Build mastery first", goalTitle)).toContain(goalTitle);
  });

  it("selectLearnerGoalLabel reads twin goal", () => {
    expect(selectLearnerGoalLabel(baseState())).toBe(goalTitle);
  });

  it("selectAssessmentReasoningSummary includes four reasoning rows", () => {
    const summary = selectAssessmentReasoningSummary(baseState(), 42);
    expect(summary.signalDetected).toBeTruthy();
    expect(summary.learningTwinUpdate).toContain("VPC Networking");
    expect(summary.decisionMade).toBeTruthy();
    expect(summary.expectedBenefit).toContain(goalTitle);
  });

  it("selectEnrichedNudgeContext includes signal, weakest topic, and outcome", () => {
    const nudge: Nudge = {
      id: "nudge-inactivity-3-ts",
      title: "Stay on track",
      body: "You've been inactive for three days.",
      severity: "warning",
      createdAt: "2026-07-18",
      read: false,
    };
    const context = selectEnrichedNudgeContext(baseState(), nudge);
    expect(context.signalLabel).toBe("Inactivity signal");
    expect(context.weakestTopic).toBe("VPC Networking");
    expect(context.targetOutcome).toBe(goalTitle);
  });

  it("selectGoalAwareAdaptation returns null without decisions", () => {
    expect(selectGoalAwareAdaptation(baseState())).toBeNull();
  });
});

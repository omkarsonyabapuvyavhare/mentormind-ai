import { describe, expect, it } from "vitest";

import {
  buildReturnWelcomeMessage,
  classifyAccountabilityTemplate,
  isInactivityNudge,
  selectActiveAccountabilityPartner,
  selectReturnWelcomeMessage,
} from "@/lib/ai/accountability-nudge";
import type { AppState } from "@/stores/store-types";
import type { Nudge } from "@/types/nudge";

const goalTitle = "Pass AWS Solutions Architect Associate (SAA-C03) in 8 weeks";

function baseState(overrides: Partial<AppState> = {}): AppState {
  return {
    twin: {
      id: "twin-1",
      goal: {
        title: goalTitle,
        targetDate: "2026-09-01",
        examCode: "SAA-C03",
        slug: "aws-saa-c03",
        category: "Cloud",
        type: "Certification",
      },
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
    roadmap: {
      id: "roadmap-1",
      goalId: "aws-saa-c03",
      milestones: [],
      tasks: [
        {
          id: "task-vpc-lesson",
          milestoneId: "ms-week-4",
          topicId: "vpc-networking",
          type: "lesson",
          title: "VPC Subnets, Route Tables, and Gateways",
          estimatedMinutes: 50,
          priority: 1,
          status: "pending",
          unlocked: true,
        },
      ],
      version: 2,
      updatedAt: "2026-07-18",
    },
    decisions: [],
    nudges: [],
    learnerEvents: [],
    isInitialized: true,
    isHydrated: true,
    presenterMode: false,
    demoStepIndex: 0,
    flowCheckpoint: null,
    adaptationReveal: null,
    mentorAutoExplain: false,
    returnWelcomeMessage: null,
    engagementTimelineBaseline: null,
    lastError: null,
    ...overrides,
  };
}

const inactivityNudge: Nudge = {
  id: "nudge-inactivity-3-ts",
  title: "Stay on track",
  body: "You've been inactive for three days.",
  severity: "warning",
  createdAt: "2026-07-18",
  read: false,
};

describe("accountability-nudge", () => {
  it("detects inactivity nudges", () => {
    expect(isInactivityNudge(inactivityNudge)).toBe(true);
  });

  it("builds inactivity template with goal, signal, reasoning, and CTA", () => {
    const state = baseState({ nudges: [inactivityNudge] });
    const partner = selectActiveAccountabilityPartner(state);

    expect(partner?.templateId).toBe("inactivity");
    expect(partner?.title).toBeTruthy();
    expect(partner?.goal).toBe(goalTitle);
    expect(partner?.lastSeenLabel).toBeTruthy();
    expect(partner?.weakTopicLabel).toContain("VPC");
    expect(partner?.reasoning).toBeTruthy();
    expect(partner?.reasoningPanel?.signal).toMatch(/Inactive for/i);
    expect(partner?.reasoningPanel?.learningTwin).toContain("VPC");
    expect(partner?.action.label).toBe("Resume Learning");
  });

  it("keeps inactivity card visible until return is acknowledged", () => {
    const state = baseState({ nudges: [inactivityNudge] });
    const partner = selectActiveAccountabilityPartner(state);

    expect(partner?.source).toBe("nudge");
    expect(partner?.templateId).toBe("inactivity");
  });

  it("shows welcome-back message after inactivity acknowledgment", () => {
    const welcome = buildReturnWelcomeMessage(baseState());
    const state = baseState({
      nudges: [{ ...inactivityNudge, read: true }],
      returnWelcomeMessage: welcome,
    });
    const partner = selectReturnWelcomeMessage(state);

    expect(partner?.source).toBe("welcome_back");
    expect(partner?.reasoning).toContain(goalTitle);
    expect(partner?.action.label).toBe("Resume Learning");
  });

  it("classifies performance recovery from quiz decision", () => {
    const state = baseState({
      decisions: [
        {
          id: "dec-1",
          eventType: "QUIZ_COMPLETED",
          reasons: ["QUIZ_BELOW_THRESHOLD"],
          explanation: "VPC gap detected — remediation added.",
          actions: [],
          createdAt: "2026-07-18",
        },
      ],
      adaptationReveal: { kind: "weakness", score: 42, visible: true },
    });

    expect(classifyAccountabilityTemplate(state, null, state.decisions[0])).toBe("performance_recovery");

    const partner = selectActiveAccountabilityPartner(state);
    expect(partner?.action.label).toBe("Review Updated Plan");
  });
});

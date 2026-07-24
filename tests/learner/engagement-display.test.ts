import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import { buildInactivityEvent } from "@/lib/demo/session-actions";
import {
  buildTimelinePreviewFrames,
  formatInactivityLastSeenLabel,
  formatLastSeenLabel,
  selectEngagementSnapshot,
  selectEngagementStatus,
} from "@/lib/learner/engagement-display";
import { runEngagementTimelineAdvance } from "@/lib/learner/engagement-timeline-advance";
import { selectWeakTopics } from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";
import type { AppState } from "@/stores/store-types";

const DEMO_ENTRY = "2026-07-17T09:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";

function baseState(overrides: Partial<AppState> = {}): AppState {
  return {
    twin: {
      id: "twin-1",
      goal: { title: "Pass AWS SAA", targetDate: "2026-09-01", examCode: "SAA-C03" },
      skillLevel: "intermediate",
      strengths: [],
      weaknesses: [],
      knownChallenges: [],
      preferences: {
        studyTimeOfDay: "evening",
        focusDurationMinutes: 45,
        preferredFormats: ["quiz"],
      },
      consistencyScore: 82,
      quizHistory: [],
      lastActiveAt: "2026-07-22T09:15:00.000Z",
      inactivityDays: 0,
      currentStreakDays: 12,
      totalStudyMinutes: 120,
      plannedStudyMinutes: 240,
      dropoutRisk: 10,
      learningVelocity: 1,
      createdAt: "2026-07-01",
      updatedAt: "2026-07-22",
    },
    roadmap: null,
    decisions: [],
    nudges: [],
    learnerEvents: [],
    isInitialized: true,
    isHydrated: true,
    demoMode: true,
    demoStepIndex: 1,
    flowCheckpoint: null,
    adaptationReveal: null,
    mentorAutoExplain: false,
    returnWelcomeMessage: null,
    engagementTimelineBaseline: null,
    lastError: null,
    ...overrides,
  };
}

describe("engagement-display", () => {
  it("formats today last seen label", () => {
    const label = formatLastSeenLabel("2026-07-22T09:15:00.000Z", new Date("2026-07-22T12:00:00.000Z"));
    expect(label).toContain("Today");
    expect(label).toMatch(/\d{1,2}:\d{2} [AP]M/);
  });

  it("marks learner active before inactivity", () => {
    const snapshot = selectEngagementSnapshot(baseState(), new Date("2026-07-22T12:00:00.000Z"));
    expect(snapshot?.status).toBe("active");
    expect(snapshot?.liveLastSeen).toBe(true);
    expect(snapshot?.streakDays).toBe(12);
    expect(snapshot?.streakDisplay).toBe("12 days");
    expect(snapshot?.dropoutRiskLevel).toBe("low");
    expect(snapshot?.lastSeenLabel).toContain("Today");
  });

  it("marks learner inactive after inactivity escalation", () => {
    const state = baseState({
      twin: {
        ...baseState().twin!,
        inactivityDays: 3,
        currentStreakDays: 0,
        dropoutRisk: 40,
      },
      decisions: [
        {
          id: "dec-inactivity",
          eventType: "INACTIVITY_TICK",
          reasons: ["INACTIVITY_ESCALATION"],
          explanation: "Inactive",
          actions: [{ action: "UPDATE_DROPOUT_RISK", dropoutRisk: 40 }],
          createdAt: "2026-07-25T18:00:00.000Z",
        },
      ],
      learnerEvents: [
        {
          id: "INACTIVITY_TICK:3:2026-07-25T18:00:00.000Z",
          type: "INACTIVITY_TICK",
          days: 3,
          timestamp: "2026-07-25T18:00:00.000Z",
        },
      ],
    });

    expect(selectEngagementStatus(state)).toBe("inactive");
    expect(formatInactivityLastSeenLabel(3)).toBe("3 days ago");
    const snapshot = selectEngagementSnapshot(state);
    expect(snapshot?.lastSeenLabel).toBe("3 days ago");
    expect(snapshot?.streakDisplay).toBe("Streak paused");
    expect(snapshot?.dropoutRisk).toBe(40);
    expect(snapshot?.dropoutRiskLevel).toBe("medium");
  });

  it("does not show low risk for inactive escalation when twin risk is stale", () => {
    const state = baseState({
      twin: {
        ...baseState().twin!,
        lastActiveAt: "2026-07-17T09:00:00.000Z",
        inactivityDays: 0,
        currentStreakDays: 12,
        dropoutRisk: 10,
      },
      decisions: [
        {
          id: "dec-inactivity",
          eventType: "INACTIVITY_TICK",
          reasons: ["INACTIVITY_ESCALATION"],
          explanation: "Inactive",
          actions: [{ action: "UPDATE_DROPOUT_RISK", dropoutRisk: 40 }],
          createdAt: INACTIVITY,
        },
      ],
      learnerEvents: [
        {
          id: "INACTIVITY_TICK:3:2026-07-27T18:00:00.000Z",
          type: "INACTIVITY_TICK",
          days: 3,
          timestamp: INACTIVITY,
        },
      ],
    });

    const snapshot = selectEngagementSnapshot(state, new Date("2026-07-22T12:00:00.000Z"));

    expect(snapshot?.status).toBe("inactive");
    expect(snapshot?.dropoutRisk).toBe(40);
    expect(snapshot?.dropoutRiskLevel).toBe("medium");
    expect(snapshot?.streakDisplay).toBe("Streak paused");
    expect(snapshot?.streakDays).toBe(0);
  });

  it("does not show a positive streak label while inactive", () => {
    const state = baseState({
      twin: {
        ...baseState().twin!,
        inactivityDays: 3,
        currentStreakDays: 12,
        dropoutRisk: 10,
        lastActiveAt: INACTIVITY,
      },
      decisions: [
        {
          id: "dec-inactivity",
          eventType: "INACTIVITY_TICK",
          reasons: ["INACTIVITY_ESCALATION"],
          explanation: "Inactive",
          actions: [{ action: "UPDATE_DROPOUT_RISK", dropoutRisk: 40 }],
          createdAt: INACTIVITY,
        },
      ],
      learnerEvents: [
        {
          id: "INACTIVITY_TICK:3:2026-07-27T18:00:00.000Z",
          type: "INACTIVITY_TICK",
          days: 3,
          timestamp: INACTIVITY,
        },
      ],
    });

    const snapshot = selectEngagementSnapshot(state, new Date("2026-07-23T12:00:00.000Z"));

    expect(snapshot?.status).toBe("inactive");
    expect(snapshot?.lastSeenLabel).toBe("3 days ago");
    expect(snapshot?.dropoutRisk).toBe(40);
    expect(snapshot?.streakDisplay).toBe("Streak paused");
    expect(snapshot?.streakDays).toBe(0);
  });

  it("demo baseline stays active despite wall-clock drift before any events", () => {
    const state = baseState({
      twin: {
        ...baseState().twin!,
        lastActiveAt: DEMO_ENTRY,
        currentStreakDays: 12,
        dropoutRisk: 10,
      },
      learnerEvents: [],
    });

    const snapshot = selectEngagementSnapshot(state, new Date("2026-07-23T12:00:00.000Z"));

    expect(snapshot?.status).toBe("active");
    expect(snapshot?.streakDisplay).toBe("12 days");
    expect(snapshot?.dropoutRisk).toBe(10);
    expect(snapshot?.lastSeenLabel).toContain("Today");
  });

  it("returns unstable object references on repeated calls (must not use as Zustand selector)", () => {
    const state = baseState();
    const first = selectEngagementSnapshot(state);
    const second = selectEngagementSnapshot(state);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);

    const framesA = buildTimelinePreviewFrames(state);
    const framesB = buildTimelinePreviewFrames(state);

    expect(framesA).toEqual(framesB);
    expect(framesA).not.toBe(framesB);
  });
});

describe("engagement timeline advance", () => {
  it("clears previewFrame after +3 Days completes", async () => {
    const previewFrames = [
      {
        status: "active" as const,
        statusLabel: "Active",
        lastSeenLabel: "Today",
        lastActiveAt: "2026-07-22T09:15:00.000Z",
        liveLastSeen: false,
        streakDays: 12,
        streakDisplay: "12 days",
        dropoutRisk: 10,
        dropoutRiskLevel: "low" as const,
        inactivityDays: 0,
      },
      {
        status: "idle" as const,
        statusLabel: "Idle",
        lastSeenLabel: "Yesterday",
        lastActiveAt: "2026-07-22T09:15:00.000Z",
        liveLastSeen: false,
        streakDays: 11,
        streakDisplay: "11 days",
        dropoutRisk: 20,
        dropoutRiskLevel: "low" as const,
        inactivityDays: 1,
      },
      {
        status: "inactive" as const,
        statusLabel: "Inactive",
        lastSeenLabel: "3 days ago",
        lastActiveAt: "2026-07-22T09:15:00.000Z",
        liveLastSeen: false,
        streakDays: 0,
        streakDisplay: "Streak paused",
        dropoutRisk: 30,
        dropoutRiskLevel: "medium" as const,
        inactivityDays: 3,
      },
    ];

    const previewUpdates: Array<unknown | null> = [];

    await runEngagementTimelineAdvance(previewFrames, {
      onPreviewFrame: (frame) => previewUpdates.push(frame),
      onAdvanceStart: () => undefined,
      onAdvanceEnd: () => undefined,
      captureBaseline: () => undefined,
      dispatchInactivity: () => undefined,
      sleep: async () => undefined,
    }, 0);

    expect(previewUpdates.at(-1)).toBeNull();
  });
});

describe("engagement snapshot integration", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
  });

  it("post-inactivity live snapshot is internally consistent", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });

    store.getState().captureEngagementTimelineBaseline();
    store.getState().dispatchLearnerEvent(buildInactivityEvent(INACTIVITY));

    const snapshot = selectEngagementSnapshot(store.getState());

    expect(snapshot?.status).toBe("inactive");
    expect(snapshot?.lastSeenLabel).toBe("3 days ago");
    expect(snapshot?.streakDisplay).toBe("Streak paused");
    expect(snapshot?.dropoutRiskLevel).not.toBe("low");
    expect(selectWeakTopics(store.getState())).toHaveLength(1);
  });

  it("reset timeline restores a consistent active baseline", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });

    store.getState().captureEngagementTimelineBaseline();
    store.getState().dispatchLearnerEvent(buildInactivityEvent(INACTIVITY));
    store.getState().resetEngagementTimeline();

    const restored = store.getState();
    const snapshot = selectEngagementSnapshot(
      restored,
      new Date(restored.twin!.lastActiveAt),
    );

    expect(snapshot?.status).toBe("active");
    expect(snapshot?.lastSeenLabel).toContain("Today");
    expect(snapshot?.streakDisplay).toBe(`${demo.initialStreakDays} days`);
    expect(snapshot?.dropoutRiskLevel).toBe("low");
    expect(snapshot?.dropoutRisk).toBeLessThanOrEqual(30);
  });
});

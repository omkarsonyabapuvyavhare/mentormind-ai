import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import {
  shouldShowResetTimeline,
} from "@/lib/demo/engagement-timeline-reset";
import { buildInactivityEvent } from "@/lib/demo/session-actions";
import {
  selectEngagementStatus,
  selectEngagementSnapshot,
} from "@/lib/learner/engagement-display";
import { selectWeakTopics } from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const DEMO_ENTRY = "2026-07-17T09:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";

function runWeakQuizFlow(store: ReturnType<typeof createTestAppStore>) {
  store.getState().enterDemoFromLanding(DEMO_ENTRY);

  const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
  store.getState().dispatchLearnerEvent({
    type: "QUIZ_COMPLETED",
    topicId: "vpc-networking",
    score: 42,
    totalQuestions: questionCount,
    timestamp: QUIZ_FAIL,
  });
}

function runInactivityWithBaselineCapture(store: ReturnType<typeof createTestAppStore>) {
  store.getState().captureEngagementTimelineBaseline();
  store.getState().dispatchLearnerEvent(buildInactivityEvent(INACTIVITY));
}

function simulatePersistedSlice(state: ReturnType<ReturnType<typeof createTestAppStore>["getState"]>) {
  return {
    twin: state.twin,
    roadmap: state.roadmap,
    decisions: state.decisions,
    nudges: state.nudges,
    learnerEvents: state.learnerEvents,
    demoStepIndex: state.demoStepIndex,
    demoMode: state.demoMode,
    isInitialized: state.isInitialized,
    engagementTimelineBaseline: state.engagementTimelineBaseline,
  };
}

describe("engagement timeline reset", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
  });

  it("+3 Days then Reset timeline restores Active engagement", () => {
    runWeakQuizFlow(store);
    runInactivityWithBaselineCapture(store);

    const inactive = store.getState();
    expect(selectEngagementStatus(inactive)).toBe("inactive");
    expect(inactive.twin?.inactivityDays).toBe(demo.inactivityDays);

    store.getState().resetEngagementTimeline();

    const restored = store.getState();
    expect(selectEngagementStatus(restored)).toBe("active");
    expect(restored.twin?.inactivityDays).toBe(0);
    expect(restored.twin?.currentStreakDays).toBe(demo.initialStreakDays);
    expect(selectEngagementSnapshot(restored)?.status).toBe("active");
    expect(shouldShowResetTimeline(restored)).toBe(false);
  });

  it("preserves weak quiz adaptation after reset", () => {
    runWeakQuizFlow(store);
    const beforeInactivity = store.getState();
    const injectedBefore = beforeInactivity.roadmap!.tasks.filter((task) => task.injectedBy);
    const weakBefore = selectWeakTopics(beforeInactivity);
    const quizScoreBefore = beforeInactivity.twin?.quizHistory.at(-1)?.score;

    runInactivityWithBaselineCapture(store);
    store.getState().resetEngagementTimeline();

    const restored = store.getState();
    const injectedAfter = restored.roadmap!.tasks.filter((task) => task.injectedBy);

    expect(restored.twin?.quizHistory.at(-1)?.score).toBe(quizScoreBefore);
    expect(selectWeakTopics(restored)).toEqual(weakBefore);
    expect(injectedAfter).toHaveLength(injectedBefore.length);
    expect(
      restored.decisions.some((decision) =>
        decision.reasons.includes("QUIZ_BELOW_THRESHOLD"),
      ),
    ).toBe(true);
    expect(restored.demoMode).toBe(true);
  });

  it("removes inactivity nudge and INACTIVITY_ESCALATION decision", () => {
    runWeakQuizFlow(store);
    runInactivityWithBaselineCapture(store);

    expect(
      store.getState().decisions.some((decision) =>
        decision.reasons.includes("INACTIVITY_ESCALATION"),
      ),
    ).toBe(true);
    expect(store.getState().nudges.some((nudge) => nudge.id.includes("inactivity"))).toBe(true);

    store.getState().resetEngagementTimeline();

    const restored = store.getState();
    expect(
      restored.decisions.some((decision) =>
        decision.reasons.includes("INACTIVITY_ESCALATION"),
      ),
    ).toBe(false);
    expect(restored.nudges.some((nudge) => nudge.id.includes("inactivity"))).toBe(false);
    expect(
      restored.learnerEvents.some((event) => event.type === "INACTIVITY_TICK"),
    ).toBe(false);
  });

  it("never shows Reset timeline for production learners", () => {
    runWeakQuizFlow(store);
    runInactivityWithBaselineCapture(store);

    store.setState({ demoMode: false });

    expect(shouldShowResetTimeline(store.getState())).toBe(false);
    store.getState().resetEngagementTimeline();
    expect(selectEngagementStatus(store.getState())).toBe("inactive");
  });

  it("restores active state from persistence after reset", () => {
    runWeakQuizFlow(store);
    runInactivityWithBaselineCapture(store);
    store.getState().resetEngagementTimeline();

    const persisted = simulatePersistedSlice(store.getState());
    const rehydrated = createTestAppStore();
    rehydrated.setState({
      ...rehydrated.getState(),
      ...persisted,
      isHydrated: true,
    });

    const state = rehydrated.getState();
    expect(selectEngagementStatus(state)).toBe("active");
    expect(state.twin?.inactivityDays).toBe(0);
    expect(state.engagementTimelineBaseline).toBeNull();
    expect(
      state.decisions.some((decision) =>
        decision.reasons.includes("INACTIVITY_ESCALATION"),
      ),
    ).toBe(false);
  });

  it("derives baseline after hard refresh while inactive without snapshot", () => {
    runWeakQuizFlow(store);
    store.getState().dispatchLearnerEvent(buildInactivityEvent(INACTIVITY));

    expect(store.getState().engagementTimelineBaseline).toBeNull();
    expect(selectEngagementStatus(store.getState())).toBe("inactive");

    store.getState().resetEngagementTimeline();

    const restored = store.getState();
    expect(selectEngagementStatus(restored)).toBe("active");
    expect(restored.twin?.inactivityDays).toBe(0);
    expect(
      restored.decisions.some((decision) =>
        decision.reasons.includes("INACTIVITY_ESCALATION"),
      ),
    ).toBe(false);
  });

  it("clears return welcome message on reset", () => {
    runWeakQuizFlow(store);
    runInactivityWithBaselineCapture(store);
    store.getState().acknowledgeLearnerReturn("Welcome back!");

    expect(store.getState().returnWelcomeMessage).toBe("Welcome back!");

    store.getState().resetEngagementTimeline();

    expect(store.getState().returnWelcomeMessage).toBeNull();
  });
});

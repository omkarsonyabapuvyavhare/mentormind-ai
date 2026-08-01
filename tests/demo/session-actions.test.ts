import { beforeEach, describe, expect, it } from "vitest";

import { shouldShowInactivityShortcut } from "@/lib/demo/session-actions";
import { awsOnboardingDefaults } from "@/lib/onboarding/schema";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";

describe("shouldShowInactivityShortcut", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    store.setState({ presenterMode: true });
  });

  it("is hidden when presenter mode is off", () => {
    store.getState().completeOnboarding(awsOnboardingDefaults, START);
    store.getState().setPresenterMode(false);

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: QUIZ_FAIL,
    });

    expect(store.getState().presenterMode).toBe(false);
    expect(shouldShowInactivityShortcut(store.getState())).toBe(false);
  });

  it("appears in presenter mode even before a weak quiz", () => {
    store.setState({ presenterMode: true });

    expect(store.getState().presenterMode).toBe(true);
    expect(shouldShowInactivityShortcut(store.getState())).toBe(true);
  });

  it("appears after a weak quiz in presenter mode", () => {
    store.setState({ presenterMode: true });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: QUIZ_FAIL,
    });

    expect(store.getState().presenterMode).toBe(true);
    expect(shouldShowInactivityShortcut(store.getState())).toBe(true);
  });

  it("hides after inactivity has already been applied", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: QUIZ_FAIL,
    });

    store.getState().dispatchLearnerEvent({
      type: "INACTIVITY_TICK",
      days: 3,
      timestamp: INACTIVITY,
    });

    expect(shouldShowInactivityShortcut(store.getState())).toBe(false);
  });

  it("shows after a new weak quiz even when an older inactivity decision exists", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: QUIZ_FAIL,
    });

    store.getState().dispatchLearnerEvent({
      type: "INACTIVITY_TICK",
      days: 3,
      timestamp: INACTIVITY,
    });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: "2026-07-28T18:00:00.000Z",
    });

    expect(shouldShowInactivityShortcut(store.getState())).toBe(true);
  });

  it("still shows when a neutral decision is recorded after the weak quiz", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: 5,
      timestamp: QUIZ_FAIL,
    });

    const state = store.getState();
    store.setState({
      decisions: [
        ...state.decisions,
        {
          id: "decision-onboarding-completed-neutral",
          eventType: "ONBOARDING_COMPLETED",
          actions: [],
          reasons: [],
          explanation: "",
          createdAt: "2026-07-25T18:00:00.000Z",
        },
      ],
    });

    expect(shouldShowInactivityShortcut(store.getState())).toBe(true);
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import { buildInactivityEvent } from "@/lib/demo/session-actions";
import {
  selectTodayStudyPresentationMinutes,
  todayStudyPresentation,
} from "@/lib/time/today-study-presentation";
import { createTestAppStore } from "@/stores/use-app-store";

const DEMO_ENTRY = "2026-07-17T09:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";
const QUIZ_MASTERY = "2026-07-28T18:00:00.000Z";

describe("selectTodayStudyPresentationMinutes", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
  });

  it("shows a believable demo baseline before any quiz", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    expect(selectTodayStudyPresentationMinutes(store.getState())).toBe(
      todayStudyPresentation.demoBaselineMinutes,
    );
    expect(store.getState().twin?.totalStudyMinutes).toBe(demo.initialStudyMinutes);
  });

  it("updates to 42 min after the weak quiz adaptation", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });

    expect(selectTodayStudyPresentationMinutes(store.getState())).toBe(42);
  });

  it("keeps 42 min after inactivity without growing while idle", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });
    store.getState().dispatchLearnerEvent(buildInactivityEvent(INACTIVITY));

    expect(selectTodayStudyPresentationMinutes(store.getState())).toBe(42);
  });

  it("shows 1h 08m after mastery", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 95,
      totalQuestions: questionCount,
      timestamp: QUIZ_MASTERY,
    });

    expect(selectTodayStudyPresentationMinutes(store.getState())).toBe(68);
  });
});

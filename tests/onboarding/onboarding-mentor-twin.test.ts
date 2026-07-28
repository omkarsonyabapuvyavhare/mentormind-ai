import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import {
  answerMentorQuestion,
  selectNextBestAction,
} from "@/lib/ai/mentor-responses";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import { createRoadmapFromOnboarding } from "@/lib/onboarding/create-from-input";
import { awsOnboardingDefaults } from "@/lib/onboarding/schema";
import {
  selectCurrentStreak,
  selectDropoutRisk,
  selectLatestDecision,
  selectNextTask,
  selectRoadmapCompletion,
  selectTopicStrength,
  selectWeakTopics,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";
const QUIZ_MASTERY = "2026-07-28T20:00:00.000Z";

describe("onboarding, learning twin, and mentor slice", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
  });

  it("A. onboarding inputs generate the expected Learning Twin", () => {
    const twin = createTwinFromOnboarding(awsOnboardingDefaults, START);

    expect(twin.skillLevel).toBe("intermediate");
    expect(twin.plannedStudyMinutes).toBe(24 * 60 * 8);
    expect(twin.knownChallenges).toEqual([
      { topicId: "vpc-networking", topicName: "Vpc Networking" },
    ]);
    expect(twin.preferences.focusDurationMinutes).toBe(45);
    expect(twin.goal.examCode).toBe("SAA-C03");
  });

  it("B. AWS goal creates an 8-week roadmap", () => {
    const twin = createTwinFromOnboarding(awsOnboardingDefaults, START);
    const roadmap = createRoadmapFromOnboarding(awsOnboardingDefaults, twin.id, START);

    expect(roadmap.milestones).toHaveLength(8);
    expect(roadmap.version).toBe(1);
  });

  it("C. Learning Twin initial state matches onboarding inputs", () => {
    store.getState().completeOnboarding(awsOnboardingDefaults, START);
    const state = store.getState();

    expect(state.isInitialized).toBe(true);
    expect(state.presenterMode).toBe(false);
    expect(state.twin?.skillLevel).toBe(awsOnboardingDefaults.skillLevel);
    expect(state.twin?.knownChallenges[0]?.topicId).toBe("vpc-networking");
    expect(state.twin?.preferences.studyTimeOfDay).toBe("evening");
    expect(state.roadmap?.milestones).toHaveLength(8);
    expect(state.learnerEvents.some((event) => event.type === "ONBOARDING_COMPLETED")).toBe(true);
  });

  it("D. 42% event updates Learning Twin weaknesses and quiz history", () => {
    store.getState().initializeDemoLearner(START);
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: awsSaaQuizzes["vpc-networking"].questions.length,
      timestamp: QUIZ_FAIL,
    });

    const state = store.getState();
    expect(selectWeakTopics(state)).toHaveLength(1);
    expect(state.twin?.quizHistory.some((attempt) => attempt.score === 42)).toBe(true);
    expect(state.learnerEvents.some((event) => event.type === "QUIZ_COMPLETED")).toBe(true);
  });

  it("E. inactivity updates streak, risk, and learner signal history", () => {
    store.getState().initializeDemoLearner(START);
    store.getState().dispatchLearnerEvent({
      type: "INACTIVITY_TICK",
      days: demo.inactivityDays,
      timestamp: INACTIVITY,
    });

    const state = store.getState();
    expect(selectCurrentStreak(state)).toBe(0);
    expect(selectDropoutRisk(state)).toBeGreaterThan(demo.initialDropoutRisk);
    expect(state.twin?.inactivityDays).toBe(demo.inactivityDays);
    expect(state.learnerEvents.some((event) => event.type === "INACTIVITY_TICK")).toBe(true);
  });

  it("F. 95% event moves VPC from weakness to strength", () => {
    store.getState().initializeDemoLearner(START);
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: awsSaaQuizzes["vpc-networking"].questions.length,
      timestamp: QUIZ_FAIL,
    });
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.masteryQuizScore,
      totalQuestions: awsSaaQuizzes["vpc-networking"].questions.length,
      timestamp: QUIZ_MASTERY,
    });

    const state = store.getState();
    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(selectTopicStrength(state, demo.primaryTopicId)?.score).toBe(95);
    expect(state.twin!.learningVelocity).toBeGreaterThan(demo.initialLearningVelocity);
  });

  it('G. AI Mentor "Why did my roadmap change?" uses the latest Decision', () => {
    store.getState().initializeDemoLearner(START);
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: awsSaaQuizzes["vpc-networking"].questions.length,
      timestamp: QUIZ_FAIL,
    });

    const response = answerMentorQuestion("why-roadmap-changed", store.getState());
    const decision = selectLatestDecision(store.getState());

    expect(decision).not.toBeNull();
    expect(response).toContain("Trigger:");
    expect(response).toContain("42%");
    expect(response).toContain(decision!.explanation.split(".")[0]);
  });

  it('H. "What should I study next?" returns the next unlocked pending task', () => {
    store.getState().initializeDemoLearner(START);
    const nextTask = selectNextTask(store.getState());
    const response = answerMentorQuestion("what-study-next", store.getState());

    expect(nextTask).not.toBeNull();
    expect(response).toContain(nextTask!.title);
    expect(selectNextBestAction(store.getState())).toContain(nextTask!.title);
  });

  it('I. "How am I progressing?" uses actual completion, consistency, streak, and risk selectors', () => {
    store.getState().initializeDemoLearner(START);
    const state = store.getState();
    const response = answerMentorQuestion("how-progressing", state);

    expect(response).toContain(`${selectRoadmapCompletion(state).percentage}%`);
    expect(response).toContain(`${state.twin!.consistencyScore}`);
    expect(response).toContain(`${selectCurrentStreak(state)}`);
    expect(response).toContain(`${selectDropoutRisk(state)}`);
  });

  it("J. reset returns all three pages to initial demo state", () => {
    store.getState().initializeDemoLearner(START);
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: awsSaaQuizzes["vpc-networking"].questions.length,
      timestamp: QUIZ_FAIL,
    });

    store.getState().resetDemo(START);
    const state = store.getState();

    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(state.decisions).toHaveLength(0);
    expect(state.twin?.currentStreakDays).toBe(demo.initialStreakDays);
    expect(selectRoadmapCompletion(state).percentage).toBe(69);
    expect(selectNextTask(state)?.id).toBe("task-vpc-lab");
  });
});

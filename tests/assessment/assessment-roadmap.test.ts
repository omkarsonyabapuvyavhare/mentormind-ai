import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import {
  buildAnswersForTargetScore,
  calculateQuizScore,
} from "@/lib/assessment/quiz-scoring";
import {
  selectDecisionTransparency,
  selectDelayedMilestones,
  selectInjectedRemedialTaskCount,
  selectInjectedTasks,
  selectLatestDecision,
  selectLatestNudge,
  selectNextTask,
  selectQuizAttemptsForTopic,
  selectRoadmapCompletion,
  selectRoadmapAccelerationDays,
  selectTopicStrength,
  selectWeakTopics,
  summarizeDecisionActions,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";
const QUIZ_MASTERY = "2026-07-28T20:00:00.000Z";
const vpcQuiz = awsSaaQuizzes["vpc-networking"];

describe("assessment and roadmap slice", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
  });

  it("A. derives roadmap completion from tasks and matches dashboard metric", () => {
    const state = store.getState();
    const completion = selectRoadmapCompletion(state);
    const completedCount = state.roadmap!.tasks.filter((task) => task.status === "completed").length;
    const totalCount = state.roadmap!.tasks.length;

    expect(completedCount).toBe(11);
    expect(totalCount).toBe(16);
    expect(completion).toBe(68);
    expect(completion).toBe(Math.floor((completedCount / totalCount) * 100));
  });

  it("B. normal quiz scoring produces the correct percentage", () => {
    const allCorrect = buildAnswersForTargetScore(vpcQuiz.questions, 100);
    const perfect = calculateQuizScore(
      vpcQuiz.questions,
      allCorrect,
      vpcQuiz.passingScore,
      thresholds.masteryScore,
    );

    expect(perfect.score).toBe(100);
    expect(perfect.correctCount).toBe(12);
    expect(perfect.incorrectCount).toBe(0);

    const failingAnswers = buildAnswersForTargetScore(vpcQuiz.questions, 42);
    const failing = calculateQuizScore(
      vpcQuiz.questions,
      failingAnswers,
      vpcQuiz.passingScore,
      thresholds.masteryScore,
    );

    expect(failing.score).toBe(42);
    expect(failing.correctCount).toBe(5);
    expect(failing.incorrectCount).toBe(7);
  });

  it("C. demo 42% mode dispatches one quiz event only", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    const afterFirst = store.getState();
    expect(afterFirst.learnerEvents.filter((event) => event.type === "QUIZ_COMPLETED")).toHaveLength(
      1,
    );

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    expect(store.getState().decisions.filter((decision) => decision.reasons.includes("QUIZ_BELOW_THRESHOLD"))).toHaveLength(1);
  });

  it("D. 42% result exposes the expected adaptation summary", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    const state = store.getState();
    const decision = selectLatestDecision(state);
    const transparency = selectDecisionTransparency(state);

    expect(decision?.reasons).toContain("QUIZ_BELOW_THRESHOLD");
    expect(decision?.explanation).toMatch(/42%/i);
    expect(transparency?.trigger).toMatch(/42%/i);
    expect(transparency?.whatChanged).toMatch(/2 revision tasks, 1 lab/i);
    expect(selectWeakTopics(state)).toHaveLength(1);
  });

  it("E. roadmap selectors show injected tasks, milestone shift, and version bump", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    const state = store.getState();
    const summary = summarizeDecisionActions(selectLatestDecision(state)!);

    expect(selectInjectedRemedialTaskCount(state)).toBe(3);
    expect(selectInjectedTasks(state)).toHaveLength(3);
    expect(summary.revisionCount).toBe(2);
    expect(summary.labCount).toBe(1);
    expect(summary.milestoneDelayDays).toBe(3);
    expect(state.roadmap!.version).toBeGreaterThan(demo.initialRoadmapVersion);
    expect(selectDelayedMilestones(state).length).toBeGreaterThan(0);
  });

  it("F. inactivity exposes shortened task duration and nudge", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    const beforeMinutes = selectNextTask(store.getState())!.estimatedMinutes;

    store.getState().dispatchLearnerEvent({
      type: "INACTIVITY_TICK",
      days: demo.inactivityDays,
      timestamp: INACTIVITY,
    });

    const state = store.getState();
    expect(selectNextTask(state)!.estimatedMinutes).toBeLessThan(beforeMinutes);
    expect(selectLatestNudge(state)).not.toBeNull();
    expect(selectLatestDecision(state)?.reasons).toContain("INACTIVITY_ESCALATION");
  });

  it("G. demo 95% mode dispatches one recovery event only", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.masteryQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_MASTERY,
    });

    const quizEvents = store.getState().learnerEvents.filter((event) => event.type === "QUIZ_COMPLETED");
    expect(quizEvents).toHaveLength(2);
    expect(
      store.getState().decisions.filter((decision) => decision.reasons.includes("QUIZ_MASTERY_ACHIEVED")),
    ).toHaveLength(1);
  });

  it("H. recovery roadmap shows weakness removed, strength added, remedial removed, advanced unlocked, acceleration", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.masteryQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_MASTERY,
    });

    const state = store.getState();
    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(selectTopicStrength(state, demo.primaryTopicId)).not.toBeNull();
    expect(
      state.roadmap!.tasks.some(
        (task) =>
          task.topicId === demo.primaryTopicId &&
          task.injectedBy !== undefined &&
          task.status === "pending",
      ),
    ).toBe(false);
    expect(
      state.roadmap!.tasks.some(
        (task) => task.topicId === thresholds.advancedUnlockTopicId && task.unlocked,
      ),
    ).toBe(true);
    expect(selectRoadmapAccelerationDays(state)).toBe(thresholds.roadmapAccelerationDays);
  });

  it("I. duplicate engine quiz failure decision is idempotent", () => {
    const event = {
      type: "QUIZ_COMPLETED" as const,
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    };

    store.getState().dispatchLearnerEvent(event);
    const afterFirst = selectInjectedRemedialTaskCount(store.getState());

    store.getState().dispatchLearnerEvent(event);
    expect(selectInjectedRemedialTaskCount(store.getState())).toBe(afterFirst);
  });

  it("J. reset restores the original roadmap", () => {
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: vpcQuiz.questions.length,
      timestamp: QUIZ_FAIL,
    });

    store.getState().resetDemo(START);

    const state = store.getState();
    expect(selectRoadmapCompletion(state)).toBe(68);
    expect(selectInjectedRemedialTaskCount(state)).toBe(0);
    expect(state.roadmap!.version).toBe(demo.initialRoadmapVersion);
    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(selectQuizAttemptsForTopic(state, demo.primaryTopicId)).toHaveLength(0);
  });
});

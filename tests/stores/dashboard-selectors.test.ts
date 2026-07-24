import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { demoInitialNextTaskId } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import {
  selectCurrentMilestone,
  selectCurrentStreak,
  selectDashboardMetrics,
  selectDropoutRiskLevel,
  selectNextTask,
  selectRoadmapCompletion,
  selectTimeSpentVsPlanned,
  selectWeakTopics,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";

describe("dashboard selectors", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
  });

  it("produces PPT-aligned initial dashboard metrics", () => {
    const state = store.getState();
    const metrics = selectDashboardMetrics(state);

    expect(selectRoadmapCompletion(state)).toBe(68);
    expect(selectCurrentStreak(state)).toBe(demo.initialStreakDays);
    expect(selectNextTask(state)?.id).toBe(demoInitialNextTaskId);
    expect(selectNextTask(state)?.title).toBe("VPC Networking Lab");
    expect(selectDropoutRiskLevel(state)).toBe("low");
    expect(selectTimeSpentVsPlanned(state)).toEqual({
      spentMinutes: demo.initialStudyMinutes,
      plannedMinutes: demo.initialPlannedMinutes,
    });
    expect(metrics.consistencyScore).toBe(demo.initialConsistencyScore);
    expect(selectCurrentMilestone(state)?.id).toBe("ms-week-4");
    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(metrics.latestQuiz).toBeNull();
  });

  it("reflects 42% demo step changes", () => {
    store.getState().runNextDemoStep(START);
    store.getState().runNextDemoStep(QUIZ_FAIL);

    const state = store.getState();
    expect(selectWeakTopics(state)).toHaveLength(1);
    expect(state.roadmap!.version).toBeGreaterThan(demo.initialRoadmapVersion);
    expect(selectDashboardMetrics(state).adaptationMessage).toMatch(/42%/i);
  });

  it("reflects inactivity changes to streak, risk, and task duration", () => {
    store.getState().runNextDemoStep(START);
    store.getState().runNextDemoStep(QUIZ_FAIL);
    const before = selectNextTask(store.getState())!.estimatedMinutes;
    store.getState().runNextDemoStep(INACTIVITY);

    const state = store.getState();
    expect(selectCurrentStreak(state)).toBe(0);
    expect(selectDropoutRiskLevel(state)).not.toBe("low");
    expect(selectNextTask(state)!.estimatedMinutes).toBeLessThan(before);
    expect(state.nudges).toHaveLength(1);
  });

  it("reflects 95% recovery in strengths and upcoming tasks", () => {
    store.getState().runAllDemoSteps(START);
    const state = store.getState();
    const metrics = selectDashboardMetrics(state);

    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(state.twin!.strengths.some((item) => item.topicId === demo.primaryTopicId)).toBe(true);
    expect(
      state.roadmap!.tasks.some(
        (task) => task.topicId === thresholds.advancedUnlockTopicId && task.unlocked,
      ),
    ).toBe(true);
    expect(metrics.adaptationMessage).toMatch(/95%/i);
  });

  it("returns to initial dashboard state after reset", () => {
    store.getState().runAllDemoSteps(START);
    store.getState().resetDemo(START);

    const state = store.getState();
    expect(selectCurrentStreak(state)).toBe(demo.initialStreakDays);
    expect(selectWeakTopics(state)).toHaveLength(0);
    expect(selectNextTask(state)?.id).toBe(demoInitialNextTaskId);
    expect(state.decisions).toHaveLength(0);
  });
});

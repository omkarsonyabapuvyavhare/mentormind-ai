import { describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import {
  computeRoadmapCompletion,
  selectCountableRoadmapTasks,
  selectMilestoneCompletion,
  selectRoadmapCompletion,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";
import type { LearningTask } from "@/types/roadmap";

const START = "2026-07-17T00:00:00.000Z";

function task(partial: Partial<LearningTask> & Pick<LearningTask, "id">): LearningTask {
  return {
    milestoneId: "ms-week-1",
    topicId: "topic-a",
    type: "lesson",
    title: partial.title ?? "Lesson",
    estimatedMinutes: 45,
    status: "pending",
    priority: 1,
    unlocked: true,
    ...partial,
  };
}

describe("roadmap completion selectors", () => {
  it("returns 0% for missing or empty roadmap", () => {
    expect(selectRoadmapCompletion({ roadmap: null })).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      percentage: 0,
    });
    expect(
      selectRoadmapCompletion({
        roadmap: {
          id: "roadmap-1",
          goalId: "goal-1",
          milestones: [],
          tasks: [],
          version: 1,
          updatedAt: START,
        },
      }),
    ).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      percentage: 0,
    });
  });

  it("calculates 0 of N as 0%", () => {
    const result = computeRoadmapCompletion([
      task({ id: "t1", status: "pending" }),
      task({ id: "t2", status: "in_progress", type: "quiz" }),
      task({ id: "t3", status: "pending", type: "lab" }),
      task({ id: "t4", status: "pending", type: "revision" }),
    ]);
    expect(result).toEqual({ completedTasks: 0, totalTasks: 4, percentage: 0 });
  });

  it("calculates 1 of 4 as 25%", () => {
    const result = computeRoadmapCompletion([
      task({ id: "t1", status: "completed" }),
      task({ id: "t2", status: "pending", type: "quiz" }),
      task({ id: "t3", status: "pending", type: "lab" }),
      task({ id: "t4", status: "pending", type: "revision" }),
    ]);
    expect(result).toEqual({ completedTasks: 1, totalTasks: 4, percentage: 25 });
  });

  it("calculates 3 of 4 as 75%", () => {
    const result = computeRoadmapCompletion([
      task({ id: "t1", status: "completed" }),
      task({ id: "t2", status: "completed", type: "quiz" }),
      task({ id: "t3", status: "completed", type: "lab" }),
      task({ id: "t4", status: "pending", type: "revision" }),
    ]);
    expect(result).toEqual({ completedTasks: 3, totalTasks: 4, percentage: 75 });
  });

  it("calculates all tasks complete as 100%", () => {
    const result = computeRoadmapCompletion([
      task({ id: "t1", status: "completed" }),
      task({ id: "t2", status: "completed", type: "quiz" }),
    ]);
    expect(result).toEqual({ completedTasks: 2, totalTasks: 2, percentage: 100 });
  });

  it("excludes skipped tasks from the denominator", () => {
    const result = computeRoadmapCompletion([
      task({ id: "t1", status: "completed" }),
      task({ id: "t2", status: "skipped", type: "quiz" }),
      task({ id: "t3", status: "pending", type: "lab" }),
    ]);
    expect(result).toEqual({ completedTasks: 1, totalTasks: 2, percentage: 50 });
  });

  it("includes injected remediation tasks in the total", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    const before = selectRoadmapCompletion(store.getState());

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: demo.primaryTopicId,
      score: demo.weakQuizScore,
      totalQuestions: 12,
      timestamp: "2026-07-24T18:00:00.000Z",
    });

    const after = selectRoadmapCompletion(store.getState());
    expect(after.totalTasks).toBeGreaterThan(before.totalTasks);
    expect(after.percentage).toBeLessThanOrEqual(before.percentage);
  });

  it("recalculates when mastery removes remedial tasks", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    store.getState().runAllDemoSteps(START);

    const completion = selectRoadmapCompletion(store.getState());
    const injectedRemaining = selectCountableRoadmapTasks(store.getState().roadmap!.tasks).filter(
      (task) => task.injectedBy !== undefined,
    );

    expect(injectedRemaining).toHaveLength(0);
    expect(completion.completedTasks).toBeLessThanOrEqual(completion.totalTasks);
    expect(completion.percentage).toBeGreaterThanOrEqual(0);
    expect(completion.percentage).toBeLessThanOrEqual(100);
  });

  it("updates after task completion in demo flow", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    const initial = selectRoadmapCompletion(store.getState());

    store.getState().runAllDemoSteps(START);
    const after = selectRoadmapCompletion(store.getState());

    expect(after.completedTasks).toBeGreaterThanOrEqual(initial.completedTasks);
    expect(after.percentage).toBeGreaterThanOrEqual(initial.percentage);
  });

  it("derives demo initial completion from roadmap tasks", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    const state = store.getState();
    const completion = selectRoadmapCompletion(state);
    const countable = selectCountableRoadmapTasks(state.roadmap!.tasks);

    expect(completion.completedTasks).toBe(
      countable.filter((task) => task.status === "completed").length,
    );
    expect(completion.totalTasks).toBe(countable.length);
    expect(completion.percentage).toBe(
      countable.length === 0
        ? 0
        : Math.round((completion.completedTasks / completion.totalTasks) * 100),
    );
    expect(completion.percentage).toBe(69);
  });

  it("computes milestone completion from active milestone tasks", () => {
    const tasks = [
      task({ id: "t1", status: "completed", milestoneId: "ms-week-1" }),
      task({ id: "t2", status: "pending", type: "quiz", milestoneId: "ms-week-1" }),
    ];
    expect(selectMilestoneCompletion(tasks)).toEqual({
      completedTasks: 1,
      totalTasks: 2,
      percentage: 50,
    });
  });
});

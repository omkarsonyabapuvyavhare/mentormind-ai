import { beforeEach, describe, expect, it, vi } from "vitest";

import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { demoSteps } from "@/data/demo-script";
import * as engineModule from "@/lib/engine/index";
import {
  selectCurrentMilestone,
  selectDemoProgress,
  selectDropoutRisk,
  selectLatestDecision,
  selectRoadmapCompletion,
  selectWeakTopics,
} from "@/stores/selectors";
import { createRoadmapFromOnboarding, createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import { onboardingInputSchema } from "@/lib/onboarding/schema";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";
const INACTIVITY = "2026-07-27T18:00:00.000Z";
const QUIZ_MASTERY = "2026-07-28T20:00:00.000Z";

describe("useAppStore", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
    store.setState({
      twin: null,
      roadmap: null,
      decisions: [],
      nudges: [],
      learnerEvents: [],
      isInitialized: false,
      isHydrated: true,
      presenterMode: false,
      demoStepIndex: 0,
      lastError: null,
    });
  });

  describe("A. demo initialization", () => {
    it("creates twin, roadmap, and clean demo state", () => {
      store.getState().initializeDemoLearner(START);
      const state = store.getState();

      expect(state.twin).not.toBeNull();
      expect(state.roadmap).not.toBeNull();
      expect(state.twin?.goal.title).toContain("AWS Solutions Architect Associate");
      expect(state.roadmap?.milestones).toHaveLength(8);
      expect(state.decisions).toHaveLength(0);
      expect(state.nudges).toHaveLength(0);
      expect(state.learnerEvents).toHaveLength(0);
      expect(state.demoStepIndex).toBe(0);
      expect(state.presenterMode).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.twin?.currentStreakDays).toBe(demo.initialStreakDays);
      expect(state.roadmap?.version).toBe(demo.initialRoadmapVersion);
    });
  });

  describe("B. 42% demo step", () => {
    it("stores weakness, remedial tasks, milestone shift, and decision", () => {
      store.getState().runNextDemoStep(START);
      store.getState().runNextDemoStep(QUIZ_FAIL);

      const state = store.getState();

      expect(selectWeakTopics(state)).toHaveLength(1);
      expect(selectWeakTopics(state)[0]?.topicId).toBe(demo.primaryTopicId);

      const injectedTasks = state.roadmap!.tasks.filter((task) => task.injectedBy);
      expect(injectedTasks).toHaveLength(3);
      expect(injectedTasks.filter((task) => task.type === "revision")).toHaveLength(2);
      expect(injectedTasks.filter((task) => task.type === "lab")).toHaveLength(1);

      const shiftDecision = state.decisions.find((decision) =>
        decision.reasons.includes("QUIZ_BELOW_THRESHOLD"),
      );
      expect(shiftDecision).toBeDefined();
      expect(shiftDecision?.actions.some((action) => action.action === "SHIFT_MILESTONE")).toBe(
        true,
      );
      expect(state.decisions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("C. inactivity step", () => {
    it("increases risk, stores one nudge, and shortens next task", () => {
      store.getState().runNextDemoStep(START);
      store.getState().runNextDemoStep(QUIZ_FAIL);
      store.getState().runNextDemoStep(INACTIVITY);

      const state = store.getState();
      const riskBeforeInactivity = 20;

      expect(selectDropoutRisk(state)).toBe(
        Math.min(100, riskBeforeInactivity + thresholds.dropoutRiskIncreaseOnInactivity),
      );
      expect(state.nudges).toHaveLength(1);
      expect(state.nudges[0]?.severity).toBe("warning");

      const inactivityDecision = state.decisions.find((decision) =>
        decision.reasons.includes("INACTIVITY_ESCALATION"),
      );
      expect(inactivityDecision?.actions.some((action) => action.action === "SHORTEN_NEXT_TASK")).toBe(
        true,
      );
    });
  });

  describe("D. 95% recovery step", () => {
    it("clears weakness, adds strength, removes pending remedial work, unlocks advanced content", () => {
      store.getState().runNextDemoStep(START);
      store.getState().runNextDemoStep(QUIZ_FAIL);
      store.getState().runNextDemoStep(INACTIVITY);
      store.getState().runNextDemoStep(QUIZ_MASTERY);

      const state = store.getState();

      expect(selectWeakTopics(state)).toHaveLength(0);
      expect(state.twin?.strengths.some((strength) => strength.topicId === demo.primaryTopicId)).toBe(
        true,
      );

      const pendingRemedial = state.roadmap!.tasks.filter(
        (task) =>
          task.topicId === demo.primaryTopicId &&
          (task.type === "revision" || task.type === "lab") &&
          task.status === "pending" &&
          task.injectedBy,
      );
      expect(pendingRemedial).toHaveLength(0);

      const advancedTask = state.roadmap!.tasks.find(
        (task) => task.topicId === thresholds.advancedUnlockTopicId,
      );
      expect(advancedTask?.unlocked).toBe(true);

      const masteryDecision = selectLatestDecision(state);
      expect(masteryDecision?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
      expect(masteryDecision?.actions.some((action) => action.action === "COMPRESS_ROADMAP")).toBe(
        true,
      );
    });
  });

  describe("E. full demo run", () => {
    it("produces reproducible final state without duplicates", () => {
      store.getState().runAllDemoSteps(START);

      const first = store.getState();
      const decisionIds = first.decisions.map((decision) => decision.id);
      const nudgeIds = first.nudges.map((nudge) => nudge.id);
      const injectedTaskIds = first.roadmap!.tasks
        .filter((task) => task.injectedBy)
        .map((task) => task.id);

      expect(new Set(decisionIds).size).toBe(decisionIds.length);
      expect(new Set(nudgeIds).size).toBe(nudgeIds.length);
      expect(new Set(injectedTaskIds).size).toBe(injectedTaskIds.length);
      expect(first.demoStepIndex).toBe(demoSteps.length);
      expect(first.decisions.length).toBeGreaterThanOrEqual(3);
      expect(first.learnerEvents.length).toBe(3);

      store.getState().resetDemo(START);
      store.getState().runAllDemoSteps(START);
      const second = store.getState();

      expect(second.decisions.map((decision) => decision.id)).toEqual(decisionIds);
      expect(second.twin?.dropoutRisk).toBe(first.twin?.dropoutRisk);
      expect(second.roadmap?.version).toBe(first.roadmap?.version);
    });
  });

  describe("F. reset", () => {
    it("returns to clean initial demo state", () => {
      store.getState().runAllDemoSteps(START);
      store.getState().resetDemo(START);

      const state = store.getState();
      expect(state.decisions).toHaveLength(0);
      expect(state.nudges).toHaveLength(0);
      expect(state.learnerEvents).toHaveLength(0);
      expect(state.demoStepIndex).toBe(0);
      expect(selectWeakTopics(state)).toHaveLength(0);
      expect(state.roadmap?.tasks.filter((task) => task.injectedBy)).toHaveLength(0);
    });
  });

  describe("G. error safety", () => {
    it("preserves prior state when evaluate fails", () => {
      store.getState().initializeDemoLearner(START);
      const before = store.getState();

      vi.spyOn(engineModule, "evaluate").mockImplementation(() => {
        throw new Error("Engine failure");
      });

      store.getState().dispatchLearnerEvent({
        type: "INACTIVITY_TICK",
        days: 3,
        timestamp: INACTIVITY,
      });

      const after = store.getState();
      expect(after.lastError).toBe("Engine failure");
      expect(after.twin).toEqual(before.twin);
      expect(after.roadmap).toEqual(before.roadmap);
      expect(after.decisions).toEqual(before.decisions);
      expect(after.nudges).toEqual(before.nudges);

      vi.restoreAllMocks();
    });
  });

  describe("H. selector correctness", () => {
    it("returns expected derived values during demo flow", () => {
      store.getState().runAllDemoSteps(START);
      const state = store.getState();

      expect(selectRoadmapCompletion(state)).toBeGreaterThan(0);
      expect(selectCurrentMilestone(state)?.id).toBe("ms-week-4");
      expect(selectWeakTopics(state)).toHaveLength(0);
      expect(selectLatestDecision(state)?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
      expect(selectDemoProgress(state)).toEqual({
        completedSteps: demoSteps.length,
        totalSteps: demoSteps.length,
        percent: 100,
      });
    });
  });

  describe("enterDemoFromLanding", () => {
    it("initializes clean demo learner with step index ready for 42% quiz", () => {
      store.getState().enterDemoFromLanding(START);
      const state = store.getState();

      expect(state.isInitialized).toBe(true);
      expect(state.presenterMode).toBe(true);
      expect(state.demoStepIndex).toBe(1);
      expect(state.twin?.goal.title).toContain("AWS Solutions Architect Associate");
      expect(state.decisions).toHaveLength(0);
      expect(state.nudges).toHaveLength(0);
      expect(state.learnerEvents).toHaveLength(0);
    });

    it("preserves existing demo state when demo is already in progress", () => {
      store.getState().enterDemoFromLanding(START);
      store.getState().runNextDemoStep(QUIZ_FAIL);

      const before = store.getState();
      store.getState().enterDemoFromLanding(START);
      const after = store.getState();

      expect(after.demoStepIndex).toBe(before.demoStepIndex);
      expect(after.decisions).toHaveLength(before.decisions.length);
      expect(after.learnerEvents).toHaveLength(before.learnerEvents.length);
      expect(after.nudges).toHaveLength(before.nudges.length);
      expect(selectWeakTopics(after)).toHaveLength(1);
    });

    it("does not duplicate initialization on repeated entry", () => {
      store.getState().enterDemoFromLanding(START);
      const twinId = store.getState().twin!.id;

      store.getState().enterDemoFromLanding(START);
      store.getState().enterDemoFromLanding(START);

      const state = store.getState();
      expect(state.twin!.id).toBe(twinId);
      expect(state.demoStepIndex).toBe(1);
      expect(state.learnerEvents).toHaveLength(0);
      expect(state.decisions).toHaveLength(0);
    });

    it("reset restores clean baseline and re-entry advances to 42% step without duplicating init", () => {
      store.getState().enterDemoFromLanding(START);
      store.getState().runNextDemoStep(QUIZ_FAIL);

      store.getState().resetDemo(START);

      let state = store.getState();
      expect(state.demoStepIndex).toBe(0);
      expect(state.decisions).toHaveLength(0);
      expect(selectWeakTopics(state)).toHaveLength(0);

      const twinId = state.twin!.id;
      store.getState().enterDemoFromLanding(START);

      state = store.getState();
      expect(state.twin!.id).toBe(twinId);
      expect(state.demoStepIndex).toBe(1);
      expect(state.learnerEvents).toHaveLength(0);
      expect(state.decisions).toHaveLength(0);
    });
  });

  describe("completeOnboardingWithRoadmap", () => {
    it("preserves presenter mode enabled before onboarding completes", () => {
      const input = onboardingInputSchema.parse({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
        goalId: "learn-python",
        skillLevel: "beginner",
        durationWeeks: 8,
        studyHoursPerWeek: 7,
        studyTimeOfDay: "evening",
        focusDurationMinutes: 45,
        preferredFormats: ["video", "quiz"],
        knownChallengeTopicIds: [],
      });
      const twin = createTwinFromOnboarding(input, START);
      const roadmap = createRoadmapFromOnboarding(input, twin.id, START);

      store.setState({ presenterMode: true });
      store.getState().completeOnboardingWithRoadmap(input, roadmap, START);

      expect(store.getState().presenterMode).toBe(true);
      expect(store.getState().isInitialized).toBe(true);
    });
  });

  describe("completeTask", () => {
    it("marks task completed and records TASK_COMPLETED event", () => {
      store.getState().initializeDemoLearner(START);
      const taskId = "task-vpc-lab";

      store.getState().completeTask(taskId, START);

      const state = store.getState();
      expect(state.roadmap?.tasks.find((task) => task.id === taskId)?.status).toBe("completed");
      expect(state.learnerEvents.some((event) => event.type === "TASK_COMPLETED")).toBe(true);
    });
  });
});

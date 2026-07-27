import { describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import { applyEngineResult } from "@/lib/engine/apply";
import {
  createInactivityDecisionId,
  createQuizDecisionId,
  findNextDependentMilestone,
  findNextPendingTask,
} from "@/lib/engine/helpers";
import { evaluate } from "@/lib/engine/index";
import {
  createDemoTwin,
  generateDemoRoadmap,
  shiftMilestoneDate,
} from "@/lib/roadmap/generate-initial";
import type { EngineContext } from "@/types/decisions";
import type { AddTasksAction, SendNudgeAction, ShiftMilestoneAction } from "@/types/decisions";

const START = "2026-07-17T00:00:00.000Z";
const QUIZ_FAIL_TIME = "2026-07-24T18:00:00.000Z";
const INACTIVITY_TIME = "2026-07-27T18:00:00.000Z";
const QUIZ_MASTERY_TIME = "2026-07-28T20:00:00.000Z";

const vpcQuestionCount = awsSaaQuizzes["vpc-networking"].questions.length;

function createBaseContext(): EngineContext {
  return {
    twin: createDemoTwin(START),
    roadmap: generateDemoRoadmap(START),
    nudges: [],
  };
}

function quizFailEvent(timestamp: string = QUIZ_FAIL_TIME) {
  return {
    type: "QUIZ_COMPLETED" as const,
    topicId: demo.primaryTopicId,
    score: demo.weakQuizScore,
    totalQuestions: vpcQuestionCount,
    timestamp,
  };
}

function inactivityEvent(timestamp: string = INACTIVITY_TIME) {
  return {
    type: "INACTIVITY_TICK" as const,
    days: demo.inactivityDays,
    timestamp,
  };
}

function quizMasteryEvent(timestamp: string = QUIZ_MASTERY_TIME) {
  return {
    type: "QUIZ_COMPLETED" as const,
    topicId: demo.primaryTopicId,
    score: demo.masteryQuizScore,
    totalQuestions: vpcQuestionCount,
    timestamp,
  };
}

function getAction<T extends { action: string }>(
  result: ReturnType<typeof evaluate>,
  actionType: T["action"],
): T | undefined {
  return result.actions.find((action) => action.action === actionType) as T | undefined;
}

describe("adaptation engine", () => {
  describe("A. quiz failure at 42%", () => {
    it("marks VPC weak, adds remedial tasks, shifts milestone, and explains", () => {
      const context = createBaseContext();
      const event = quizFailEvent();
      const result = evaluate(event, context);
      const applied = applyEngineResult(context, result);

      const weakness = applied.twin.weaknesses.find(
        (entry) => entry.topicId === demo.primaryTopicId,
      );
      expect(weakness).toBeDefined();
      expect(weakness?.score).toBe(42);

      const addTasks = getAction<AddTasksAction>(result, "ADD_TASKS");
      expect(addTasks?.tasks).toHaveLength(3);
      expect(addTasks?.tasks.filter((task) => task.type === "revision")).toHaveLength(2);
      expect(addTasks?.tasks.filter((task) => task.type === "lab")).toHaveLength(1);

      const shift = getAction<ShiftMilestoneAction>(result, "SHIFT_MILESTONE");
      expect(shift?.daysDelta).toBe(thresholds.milestoneDelayDays);

      const nextMilestone = findNextDependentMilestone(context.roadmap, demo.primaryTopicId);
      const shifted = applied.roadmap.milestones.find(
        (milestone) => milestone.id === nextMilestone?.id,
      );
      expect(shifted?.targetDate).toBe(
        shiftMilestoneDate(nextMilestone!.targetDate, thresholds.milestoneDelayDays),
      );

      expect(applied.twin.dropoutRisk).toBe(
        context.twin.dropoutRisk + thresholds.dropoutRiskIncreaseOnQuizFail,
      );
      expect(applied.roadmap.version).toBe(context.roadmap.version + 1);

      expect(result.decision.reasons).toContain("QUIZ_BELOW_THRESHOLD");
      expect(result.decision.reasons).toContain("MILESTONE_DELAYED_FOR_REMEDIATION");
      expect(result.decision.explanation).toMatch(/42%/i);
      expect(result.decision.explanation).toMatch(/VPC Networking/i);
      expect(result.decision.explanation).toMatch(/revision/i);
      expect(result.decision.explanation).toMatch(/lab/i);
      expect(result.decision.explanation).toMatch(/three days/i);
    });
  });

  describe("B. duplicate quiz failure event", () => {
    it("does not duplicate remedial tasks or milestone shifts", () => {
      const context = createBaseContext();
      const event = quizFailEvent();
      const first = evaluate(event, context);
      const afterFirst = applyEngineResult(context, first);
      const second = evaluate(event, afterFirst);

      expect(second.actions).toHaveLength(0);
      expect(second.decision.id).toBe(createQuizDecisionId(event));
      expect(afterFirst.roadmap.tasks.filter((task) => task.injectedBy === first.decision.id)).toHaveLength(3);
    });
  });

  describe("C. three-day inactivity", () => {
    it("increases risk, shortens next task, sends one nudge, and explains", () => {
      let context = createBaseContext();
      context = applyEngineResult(context, evaluate(quizFailEvent(), context));

      const event = inactivityEvent();
      const result = evaluate(event, context);
      const applied = applyEngineResult(context, result);

      const nextTaskBefore = findNextPendingTask(context.roadmap)!;
      const expectedMinutes = Math.max(
        thresholds.minTaskDurationMinutes,
        Math.round(nextTaskBefore.estimatedMinutes * thresholds.nextTaskShortenFactor),
      );

      expect(applied.twin.dropoutRisk).toBe(
        Math.min(100, context.twin.dropoutRisk + thresholds.dropoutRiskIncreaseOnInactivity),
      );
      expect(applied.twin.inactivityDays).toBe(3);
      expect(applied.twin.consistencyScore).toBe(
        context.twin.consistencyScore - thresholds.consistencyDecreaseOnInactivity,
      );

      const shortened = applied.roadmap.tasks.find((task) => task.id === nextTaskBefore.id);
      expect(shortened?.estimatedMinutes).toBe(expectedMinutes);

      expect(applied.nudges).toHaveLength(1);
      expect(result.decision.reasons).toContain("INACTIVITY_ESCALATION");
      expect(result.decision.explanation).toMatch(/three days/i);
      expect(result.decision.explanation).toMatch(/shortened/i);
    });
  });

  describe("D. duplicate inactivity event", () => {
    it("does not duplicate nudges or shorten the same task again", () => {
      let context = createBaseContext();
      context = applyEngineResult(context, evaluate(quizFailEvent(), context));

      const event = inactivityEvent();
      const first = evaluate(event, context);
      const afterFirst = applyEngineResult(context, first);
      const nextTaskId = findNextPendingTask(context.roadmap)!.id;
      const minutesAfterFirst = afterFirst.roadmap.tasks.find((task) => task.id === nextTaskId)!
        .estimatedMinutes;

      const second = evaluate(event, afterFirst);
      const afterSecond = applyEngineResult(afterFirst, second);

      expect(second.actions).toHaveLength(0);
      expect(afterSecond.nudges).toHaveLength(1);
      expect(
        afterSecond.roadmap.tasks.find((task) => task.id === nextTaskId)?.estimatedMinutes,
      ).toBe(minutesAfterFirst);
    });
  });

  describe("E. mastery recovery at 95%", () => {
    it("recovers from weakness, removes pending remedial work, unlocks advanced content, accelerates roadmap", () => {
      let context = createBaseContext();
      context = applyEngineResult(context, evaluate(quizFailEvent(), context));

      const remedialTasks = context.roadmap.tasks.filter((task) => task.injectedBy !== undefined);
      expect(remedialTasks.length).toBeGreaterThanOrEqual(3);

      const completedRemedialId = remedialTasks[0].id;
      context = {
        ...context,
        roadmap: {
          ...context.roadmap,
          tasks: context.roadmap.tasks.map((task) =>
            task.id === completedRemedialId
              ? { ...task, status: "completed" as const }
              : task,
          ),
        },
      };

      const event = quizMasteryEvent();
      const result = evaluate(event, context);
      const applied = applyEngineResult(context, result);

      expect(
        applied.twin.weaknesses.some((weakness) => weakness.topicId === demo.primaryTopicId),
      ).toBe(false);
      expect(
        applied.twin.strengths.some((strength) => strength.topicId === demo.primaryTopicId),
      ).toBe(true);

      const remainingPendingRemedial = applied.roadmap.tasks.filter(
        (task) =>
          task.topicId === demo.primaryTopicId &&
          (task.type === "revision" || task.type === "lab") &&
          task.status === "pending" &&
          task.injectedBy !== undefined,
      );
      expect(remainingPendingRemedial).toHaveLength(0);
      expect(
        applied.roadmap.tasks.some(
          (task) => task.id === completedRemedialId && task.status === "completed",
        ),
      ).toBe(true);

      const advancedTask = applied.roadmap.tasks.find(
        (task) => task.topicId === thresholds.advancedUnlockTopicId,
      );
      expect(advancedTask?.unlocked).toBe(true);

      const msWeek5Before = context.roadmap.milestones.find((milestone) => milestone.id === "ms-week-5")!;
      const msWeek5After = applied.roadmap.milestones.find((milestone) => milestone.id === "ms-week-5")!;
      expect(msWeek5After.targetDate).toBe(
        shiftMilestoneDate(msWeek5Before.targetDate, -thresholds.roadmapAccelerationDays),
      );

      expect(applied.twin.dropoutRisk).toBeLessThan(context.twin.dropoutRisk);
      expect(applied.twin.consistencyScore).toBeGreaterThan(context.twin.consistencyScore);
      expect(applied.roadmap.version).toBe(context.roadmap.version + 1);

      expect(result.decision.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
      expect(result.decision.reasons).toContain("REVISION_NO_LONGER_NEEDED");
      expect(result.decision.reasons).toContain("ROADMAP_ACCELERATED");
      expect(result.decision.explanation).toMatch(/95%/i);
      expect(result.decision.explanation).toMatch(/mastery/i);
      expect(result.decision.explanation).toMatch(/advanced/i);
      expect(result.decision.explanation).toMatch(/two days/i);
    });
  });

  describe("F. immutability", () => {
    it("does not mutate the input context", () => {
      const context = createBaseContext();
      const snapshot = structuredClone(context);

      evaluate(quizFailEvent(), context);
      evaluate(inactivityEvent(), context);
      evaluate(quizMasteryEvent(), context);

      expect(context).toEqual(snapshot);
    });
  });

  describe("decision IDs", () => {
    it("uses deterministic decision IDs", () => {
      const failEvent = quizFailEvent();
      const inactivity = inactivityEvent();

      expect(createQuizDecisionId(failEvent)).toBe(
        `decision-quiz-${demo.primaryTopicId}-42-${QUIZ_FAIL_TIME}`,
      );
      expect(createInactivityDecisionId(inactivity)).toBe(
        `decision-inactivity-3-${INACTIVITY_TIME}`,
      );
    });
  });

  describe("inactivity nudge content", () => {
    it("creates exactly one warning nudge", () => {
      const context = createBaseContext();
      const result = evaluate(inactivityEvent(), context);
      const nudge = getAction<SendNudgeAction>(result, "SEND_NUDGE");

      expect(nudge?.nudge.severity).toBe("warning");
      expect(nudge?.nudge.body).toMatch(/three study sessions|three days|been away/i);
      expect(nudge?.nudge.body).not.toMatch(/hardcoded/i);
    });
  });
});

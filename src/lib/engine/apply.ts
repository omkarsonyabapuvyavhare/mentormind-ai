import {
  createLabTaskId,
  createRevisionTaskId,
  addDaysToIso,
} from "@/lib/engine/helpers";
import type { EngineContext, EngineResult } from "@/types/decisions";
import type { LearningTask, NewLearningTask } from "@/types/roadmap";
import type { TopicScore } from "@/types/learning-twin";

function cloneContext(context: EngineContext): EngineContext {
  return {
    twin: structuredClone(context.twin),
    roadmap: structuredClone(context.roadmap),
    nudges: context.nudges ? structuredClone(context.nudges) : [],
  };
}

function resolveAddedTaskId(
  task: NewLearningTask,
  decisionId: string,
  _batchIndex: number,
  revisionCounter: { count: number },
): string {
  if (task.type === "revision") {
    revisionCounter.count += 1;
    return createRevisionTaskId(task.topicId, revisionCounter.count, decisionId);
  }

  return createLabTaskId(task.topicId, decisionId);
}

/** Applies an engine result to a cloned context — used by tests and future store layer. */
export function applyEngineResult(
  context: EngineContext,
  result: EngineResult,
): EngineContext {
  const next = cloneContext(context);
  const decisionId = result.decision.id;

  Object.assign(next.twin, result.twinPatch);

  for (const action of result.actions) {
    switch (action.action) {
      case "MARK_WEAKNESS": {
        const filtered = next.twin.weaknesses.filter(
          (weakness) => weakness.topicId !== action.topicId,
        );
        const entry: TopicScore = {
          topicId: action.topicId,
          topicName: action.topicName,
          score: action.score,
          lastAssessedAt: result.decision.createdAt,
        };
        next.twin.weaknesses = [...filtered, entry];
        break;
      }
      case "MARK_STRENGTH": {
        next.twin.weaknesses = next.twin.weaknesses.filter(
          (weakness) => weakness.topicId !== action.topicId,
        );
        const entry: TopicScore = {
          topicId: action.topicId,
          topicName: action.topicName,
          score: action.score,
          lastAssessedAt: result.decision.createdAt,
        };
        const existing = next.twin.strengths.findIndex(
          (strength) => strength.topicId === action.topicId,
        );
        if (existing >= 0) {
          next.twin.strengths[existing] = entry;
        } else {
          next.twin.strengths.push(entry);
        }
        break;
      }
      case "ADD_TASKS": {
        const revisionCounter = { count: 0 };
        const newTasks: LearningTask[] = action.tasks.map((task, index) => ({
          ...task,
          id: resolveAddedTaskId(task, task.injectedBy ?? decisionId, index, revisionCounter),
        }));
        next.roadmap.tasks = [...next.roadmap.tasks, ...newTasks];
        break;
      }
      case "REMOVE_TASKS": {
        next.roadmap.tasks = next.roadmap.tasks.filter(
          (task) => !action.taskIds.includes(task.id),
        );
        break;
      }
      case "SHIFT_MILESTONE": {
        next.roadmap.milestones = next.roadmap.milestones.map((milestone) => {
          if (milestone.id !== action.milestoneId) {
            return milestone;
          }

          const shiftedDate = addDaysToIso(milestone.targetDate, action.daysDelta);
          return {
            ...milestone,
            targetDate: shiftedDate,
            status: milestone.status === "upcoming" ? "delayed" : milestone.status,
          };
        });
        break;
      }
      case "UNLOCK_CONTENT": {
        const topicSet = new Set(action.topicIds);
        next.roadmap.tasks = next.roadmap.tasks.map((task) =>
          topicSet.has(task.topicId) ? { ...task, unlocked: true } : task,
        );
        break;
      }
      case "COMPRESS_ROADMAP": {
        next.roadmap.milestones = next.roadmap.milestones.map((milestone) => {
          if (milestone.status === "completed") {
            return milestone;
          }

          return {
            ...milestone,
            targetDate: addDaysToIso(milestone.targetDate, -action.daysSaved),
          };
        });
        break;
      }
      case "UPDATE_DROPOUT_RISK":
        next.twin.dropoutRisk = action.dropoutRisk;
        break;
      case "SHORTEN_NEXT_TASK":
        next.roadmap.tasks = next.roadmap.tasks.map((task) =>
          task.id === action.taskId
            ? { ...task, estimatedMinutes: action.newMinutes }
            : task,
        );
        break;
      case "SEND_NUDGE": {
        if (!next.nudges) {
          next.nudges = [];
        }
        if (!next.nudges.some((nudge) => nudge.id === action.nudge.id)) {
          next.nudges.push(action.nudge);
        }
        break;
      }
      case "UPDATE_LEARNING_VELOCITY":
        next.twin.learningVelocity = action.value;
        break;
      case "UPDATE_ROADMAP_VERSION":
        next.roadmap.version = action.version;
        next.roadmap.updatedAt = result.decision.createdAt;
        break;
      default:
        break;
    }
  }

  if (result.twinPatch.quizHistory) {
    next.twin.quizHistory = result.twinPatch.quizHistory;
  }

  return next;
}

export function applyEngineResults(
  context: EngineContext,
  results: EngineResult[],
): EngineContext {
  return results.reduce((current, result) => applyEngineResult(current, result), context);
}

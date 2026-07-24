import type { LearnerEventType } from "./events";
import type { LearningTwin } from "./learning-twin";
import type { Nudge } from "./nudge";
import type { NewLearningTask, Roadmap } from "./roadmap";

export type ReasonCode =
  | "QUIZ_BELOW_THRESHOLD"
  | "QUIZ_MASTERY_ACHIEVED"
  | "INACTIVITY_ESCALATION"
  | "REVISION_NO_LONGER_NEEDED"
  | "MILESTONE_DELAYED_FOR_REMEDIATION"
  | "ROADMAP_ACCELERATED"
  | "TASK_COMPLETED"
  | "SESSION_MISSED";

export interface MarkWeaknessAction {
  action: "MARK_WEAKNESS";
  topicId: string;
  topicName: string;
  score: number;
}

export interface MarkStrengthAction {
  action: "MARK_STRENGTH";
  topicId: string;
  topicName: string;
  score: number;
}

export interface AddTasksAction {
  action: "ADD_TASKS";
  tasks: NewLearningTask[];
}

export interface RemoveTasksAction {
  action: "REMOVE_TASKS";
  taskIds: string[];
}

export interface ShiftMilestoneAction {
  action: "SHIFT_MILESTONE";
  milestoneId: string;
  daysDelta: number;
}

export interface UnlockContentAction {
  action: "UNLOCK_CONTENT";
  topicIds: string[];
}

export interface CompressRoadmapAction {
  action: "COMPRESS_ROADMAP";
  daysSaved: number;
}

export interface UpdateDropoutRiskAction {
  action: "UPDATE_DROPOUT_RISK";
  dropoutRisk: number;
}

export interface ShortenNextTaskAction {
  action: "SHORTEN_NEXT_TASK";
  taskId: string;
  newMinutes: number;
}

export interface SendNudgeAction {
  action: "SEND_NUDGE";
  nudge: Nudge;
}

export interface UpdateLearningVelocityAction {
  action: "UPDATE_LEARNING_VELOCITY";
  value: number;
}

export interface UpdateRoadmapVersionAction {
  action: "UPDATE_ROADMAP_VERSION";
  version: number;
}

export type DecisionAction =
  | MarkWeaknessAction
  | MarkStrengthAction
  | AddTasksAction
  | RemoveTasksAction
  | ShiftMilestoneAction
  | UnlockContentAction
  | CompressRoadmapAction
  | UpdateDropoutRiskAction
  | ShortenNextTaskAction
  | SendNudgeAction
  | UpdateLearningVelocityAction
  | UpdateRoadmapVersionAction;

export interface Decision {
  id: string;
  eventType: LearnerEventType;
  actions: DecisionAction[];
  reasons: ReasonCode[];
  explanation: string;
  createdAt: string;
}

export interface EngineContext {
  twin: LearningTwin;
  roadmap: Roadmap;
  /** Optional nudges already sent — used for idempotent inactivity handling. */
  nudges?: import("./nudge").Nudge[];
}

export interface EngineResult {
  twinPatch: Partial<LearningTwin>;
  actions: DecisionAction[];
  decision: Decision;
}

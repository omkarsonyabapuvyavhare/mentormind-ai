import type { LearningTwin } from "./learning-twin";

export interface OnboardingCompletedEvent {
  id: string;
  type: "ONBOARDING_COMPLETED";
  twin: LearningTwin;
  timestamp: string;
}

export interface QuizCompletedEvent {
  id: string;
  type: "QUIZ_COMPLETED";
  topicId: string;
  score: number;
  totalQuestions: number;
  correctCount?: number;
  incorrectCount?: number;
  masteredConceptTags?: string[];
  weakConceptTags?: string[];
  timestamp: string;
}

export interface TaskCompletedEvent {
  id: string;
  type: "TASK_COMPLETED";
  taskId: string;
  timestamp: string;
}

export interface TaskSkippedEvent {
  id: string;
  type: "TASK_SKIPPED";
  taskId: string;
  timestamp: string;
}

export interface SessionMissedEvent {
  id: string;
  type: "SESSION_MISSED";
  timestamp: string;
}

export interface InactivityTickEvent {
  id: string;
  type: "INACTIVITY_TICK";
  days: number;
  timestamp: string;
}

export interface StudySessionLoggedEvent {
  id: string;
  type: "STUDY_SESSION_LOGGED";
  durationMinutes: number;
  timestamp: string;
}

export type LearnerEvent =
  | OnboardingCompletedEvent
  | QuizCompletedEvent
  | TaskCompletedEvent
  | TaskSkippedEvent
  | SessionMissedEvent
  | InactivityTickEvent
  | StudySessionLoggedEvent;

export type LearnerEventType = LearnerEvent["type"];

/** Event payload accepted before a deterministic id is assigned at dispatch. */
export type LearnerEventPayload =
  | Omit<OnboardingCompletedEvent, "id">
  | Omit<QuizCompletedEvent, "id">
  | Omit<TaskCompletedEvent, "id">
  | Omit<TaskSkippedEvent, "id">
  | Omit<SessionMissedEvent, "id">
  | Omit<InactivityTickEvent, "id">
  | Omit<StudySessionLoggedEvent, "id">;

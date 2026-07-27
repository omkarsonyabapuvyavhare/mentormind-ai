import type { EngagementTimelineBaseline } from "@/lib/demo/engagement-timeline-reset";
import type { DemoFlowHint } from "@/lib/demo/flow-hint";
import type { AdaptationReveal } from "@/types/ui-state";
import type { LearningTwin, Roadmap } from "@/types";
import type { Decision } from "@/types/decisions";
import type { LearnerEvent, LearnerEventPayload } from "@/types/events";
import type { Nudge } from "@/types/nudge";

export interface AppState {
  twin: LearningTwin | null;
  roadmap: Roadmap | null;
  decisions: Decision[];
  nudges: Nudge[];
  learnerEvents: LearnerEvent[];
  isInitialized: boolean;
  isHydrated: boolean;
  /** Hidden presenter tooling — activated via ?presenter=true or env flag. */
  presenterMode: boolean;
  demoStepIndex: number;
  flowCheckpoint: DemoFlowHint | null;
  adaptationReveal: AdaptationReveal | null;
  mentorAutoExplain: boolean;
  returnWelcomeMessage: string | null;
  /** Demo-only snapshot captured immediately before +3 Days fast-forward. */
  engagementTimelineBaseline: EngagementTimelineBaseline | null;
  lastError: string | null;
}

export interface AppActions {
  initializeDemoLearner: (timestamp: string) => void;
  dispatchLearnerEvent: (event: LearnerEventPayload) => void;
  applyEngineResult: (result: import("@/types/decisions").EngineResult) => void;
  completeTask: (taskId: string, timestamp: string) => void;
  resetDemo: (timestamp: string) => void;
  resetJourney: () => void;
  setPresenterMode: (enabled: boolean) => void;
  /** Sync presenter mode from URL/session/env — never downgrades an active session. */
  syncPresenterMode: (search?: string, source?: string) => boolean;
  /** @deprecated Legacy script runner — tests and recovery panel only. */
  enterDemoFromLanding: (timestamp: string) => void;
  /** @deprecated Legacy script runner — tests and recovery panel only. */
  runNextDemoStep: (timestamp: string) => void;
  /** @deprecated Legacy script runner — tests and recovery panel only. */
  runAllDemoSteps: (timestamp: string) => void;
  markNudgeRead: (nudgeId: string) => void;
  completeOnboarding: (input: import("@/lib/onboarding/schema").OnboardingInput, timestamp: string) => void;
  completeOnboardingWithRoadmap: (
    input: import("@/lib/onboarding/schema").OnboardingInput,
    roadmap: import("@/types/roadmap").Roadmap,
    timestamp: string,
  ) => void;
  markFlowCheckpoint: (hint: import("@/lib/demo/flow-hint").DemoFlowHint) => void;
  showAdaptationReveal: (kind: import("@/types/ui-state").AdaptationRevealKind, score: number) => void;
  dismissAdaptationReveal: () => void;
  requestMentorAutoExplain: () => void;
  clearMentorAutoExplain: () => void;
  acknowledgeLearnerReturn: (message: string) => void;
  clearReturnWelcome: () => void;
  captureEngagementTimelineBaseline: () => void;
  resetEngagementTimeline: () => void;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

export type AppStore = AppState & AppActions;

export const initialAppState: AppState = {
  twin: null,
  roadmap: null,
  decisions: [],
  nudges: [],
  learnerEvents: [],
  isInitialized: false,
  isHydrated: false,
  presenterMode: false,
  demoStepIndex: 0,
  flowCheckpoint: null,
  adaptationReveal: null,
  mentorAutoExplain: false,
  returnWelcomeMessage: null,
  engagementTimelineBaseline: null,
  lastError: null,
};

export function createLearnerEventId(event: LearnerEventPayload): string {
  switch (event.type) {
    case "QUIZ_COMPLETED":
      return `${event.type}:${event.topicId}:${event.score}:${event.timestamp}`;
    case "INACTIVITY_TICK":
      return `${event.type}:${event.days}:${event.timestamp}`;
    case "TASK_COMPLETED":
      return `${event.type}:${event.taskId}:${event.timestamp}`;
    case "TASK_SKIPPED":
      return `${event.type}:${event.taskId}:${event.timestamp}`;
    case "SESSION_MISSED":
      return `${event.type}:${event.timestamp}`;
    case "STUDY_SESSION_LOGGED":
      return `${event.type}:${event.durationMinutes}:${event.timestamp}`;
    case "ONBOARDING_COMPLETED":
      return `${event.type}:${event.twin.id}:${event.timestamp}`;
  }
}

/** @deprecated Use createLearnerEventId or event.id */
export function learnerEventKey(event: LearnerEvent | LearnerEventPayload): string {
  if ("id" in event && typeof event.id === "string" && event.id.length > 0) {
    return event.id;
  }

  return createLearnerEventId(event);
}

export function ensureLearnerEventId(
  event: LearnerEvent | (LearnerEventPayload & { id?: string }),
): LearnerEvent {
  if ("id" in event && typeof event.id === "string" && event.id.length > 0) {
    return event as LearnerEvent;
  }

  const { id: _ignored, ...payload } = event as LearnerEventPayload & { id?: string };
  return {
    ...payload,
    id: createLearnerEventId(payload),
  } as LearnerEvent;
}

export function getLearnerEventReactKey(event: LearnerEvent, index: number): string {
  if (event.id) {
    return event.id;
  }

  return [
    event.type,
    event.timestamp,
    "topicId" in event ? event.topicId : "",
    "score" in event ? event.score : "",
    "taskId" in event ? event.taskId : "",
    index,
  ].join("-");
}

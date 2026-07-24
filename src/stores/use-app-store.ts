import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appConfig } from "@/config/app-config";
import { demoSteps } from "@/data/demo-script";
import { applyEngineResult } from "@/lib/engine/apply";
import { evaluate } from "@/lib/engine/index";
import {
  createDemoTwin,
  generateDemoRoadmap,
} from "@/lib/roadmap/generate-initial";
import {
  demoEntryStepIndex,
  isCleanDemoBaseline,
  isDemoInProgress,
} from "@/lib/demo/demo-entry";
import {
  buildEngagementTimelineBaselineFromState,
  resolveEngagementTimelineBaseline,
} from "@/lib/demo/engagement-timeline-reset";
import {
  createRoadmapFromOnboarding,
  createTwinFromOnboarding,
} from "@/lib/onboarding/create-from-input";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import {
  ensureLearnerEventId,
  initialAppState,
  type AppState,
  type AppStore,
} from "@/stores/store-types";
import type { EngineContext, EngineResult } from "@/types/decisions";
import type { LearnerEvent, LearnerEventPayload } from "@/types/events";
import type { Roadmap } from "@/types/roadmap";
import { learningTwinSchema, roadmapSchema } from "@/types/schemas";

type PersistedAppState = Pick<
  AppState,
  | "twin"
  | "roadmap"
  | "decisions"
  | "nudges"
  | "learnerEvents"
  | "demoStepIndex"
  | "demoMode"
  | "isInitialized"
  | "engagementTimelineBaseline"
>;

function buildEngineContext(state: AppState): EngineContext {
  if (!state.twin || !state.roadmap) {
    throw new Error("Learning Twin and roadmap must be initialized before dispatching events.");
  }

  return {
    twin: structuredClone(state.twin),
    roadmap: structuredClone(state.roadmap),
    nudges: structuredClone(state.nudges),
  };
}

function mergeEngineResultIntoState(
  state: AppState,
  event: LearnerEvent,
  result: EngineResult,
  roadmapOverride?: Roadmap,
): AppState {
  const baseContext: EngineContext = {
    twin: structuredClone(state.twin!),
    roadmap: structuredClone(roadmapOverride ?? state.roadmap!),
    nudges: structuredClone(state.nudges),
  };

  const applied = applyEngineResult(baseContext, result);
  const eventId = event.id;

  const decisionExists = state.decisions.some(
    (decision) => decision.id === result.decision.id,
  );
  const eventExists = state.learnerEvents.some((existing) => existing.id === eventId);

  const mergedNudges = [...state.nudges];
  for (const nudge of applied.nudges ?? []) {
    if (!mergedNudges.some((existing) => existing.id === nudge.id)) {
      mergedNudges.push(nudge);
    }
  }

  return {
    ...state,
    twin: applied.twin,
    roadmap: applied.roadmap,
    nudges: mergedNudges,
    decisions: decisionExists ? state.decisions : [...state.decisions, result.decision],
    learnerEvents: eventExists ? state.learnerEvents : [...state.learnerEvents, event],
    lastError: null,
  };
}

function validatePersistedState(persisted: unknown): PersistedAppState | null {
  if (!persisted || typeof persisted !== "object") {
    return null;
  }

  const candidate = persisted as Partial<PersistedAppState>;

  if (candidate.twin) {
    const twinWithDefaults = {
      ...candidate.twin,
      knownChallenges:
        "knownChallenges" in candidate.twin && Array.isArray(candidate.twin.knownChallenges)
          ? candidate.twin.knownChallenges
          : [],
    };
    const twinResult = learningTwinSchema.safeParse(twinWithDefaults);
    if (!twinResult.success) {
      return null;
    }
    candidate.twin = twinResult.data;
  }

  if (candidate.roadmap) {
    const roadmapResult = roadmapSchema.safeParse(candidate.roadmap);
    if (!roadmapResult.success) {
      return null;
    }
    candidate.roadmap = roadmapResult.data;
  }

  return {
    twin: candidate.twin ?? null,
    roadmap: candidate.roadmap ?? null,
    decisions: Array.isArray(candidate.decisions) ? candidate.decisions : [],
    nudges: Array.isArray(candidate.nudges) ? candidate.nudges : [],
    learnerEvents: Array.isArray(candidate.learnerEvents)
      ? candidate.learnerEvents
          .filter((event) => Boolean(event && typeof event === "object" && "type" in event))
          .map((event) =>
            ensureLearnerEventId(event as LearnerEventPayload & { id?: string }),
          )
      : [],
    demoStepIndex: typeof candidate.demoStepIndex === "number" ? candidate.demoStepIndex : 0,
    demoMode: Boolean(candidate.demoMode),
    isInitialized: Boolean(candidate.isInitialized),
    engagementTimelineBaseline:
      candidate.engagementTimelineBaseline &&
      typeof candidate.engagementTimelineBaseline === "object" &&
      candidate.engagementTimelineBaseline.twin &&
      candidate.engagementTimelineBaseline.roadmap
        ? (candidate.engagementTimelineBaseline as AppState["engagementTimelineBaseline"])
        : null,
  };
}

export function createAppStoreSlice(
  set: (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void,
  get: () => AppStore,
): AppStore {
  const commitLearnerEvent = (event: LearnerEventPayload, roadmapOverride?: Roadmap) => {
    const normalizedEvent = ensureLearnerEventId(event);
    const previous = get();
    const snapshot: AppState = {
      twin: previous.twin,
      roadmap: previous.roadmap,
      decisions: previous.decisions,
      nudges: previous.nudges,
      learnerEvents: previous.learnerEvents,
      isInitialized: previous.isInitialized,
      isHydrated: previous.isHydrated,
      demoMode: previous.demoMode,
      demoStepIndex: previous.demoStepIndex,
      flowCheckpoint: previous.flowCheckpoint,
      adaptationReveal: previous.adaptationReveal,
      mentorAutoExplain: previous.mentorAutoExplain,
      returnWelcomeMessage: previous.returnWelcomeMessage,
      engagementTimelineBaseline: previous.engagementTimelineBaseline,
      lastError: previous.lastError,
    };

    try {
      const context = buildEngineContext({
        ...snapshot,
        roadmap: roadmapOverride ?? snapshot.roadmap,
      });
      const result = evaluate(normalizedEvent, context);
      const nextState = mergeEngineResultIntoState(snapshot, normalizedEvent, result, roadmapOverride);

      set({
        twin: nextState.twin,
        roadmap: nextState.roadmap,
        decisions: nextState.decisions,
        nudges: nextState.nudges,
        learnerEvents: nextState.learnerEvents,
        lastError: null,
      });
    } catch (error) {
      set({
        twin: snapshot.twin,
        roadmap: snapshot.roadmap,
        decisions: snapshot.decisions,
        nudges: snapshot.nudges,
        learnerEvents: snapshot.learnerEvents,
        lastError: error instanceof Error ? error.message : "Failed to process learner event.",
      });
    }
  };

  return {
    ...initialAppState,

    initializeDemoLearner: (timestamp) => {
      set({
        twin: createDemoTwin(timestamp),
        roadmap: generateDemoRoadmap(timestamp),
        decisions: [],
        nudges: [],
        learnerEvents: [],
        demoStepIndex: 0,
        flowCheckpoint: null,
        adaptationReveal: null,
        mentorAutoExplain: false,
        returnWelcomeMessage: null,
        engagementTimelineBaseline: null,
        demoMode: true,
        isInitialized: true,
        lastError: null,
      });
    },

    dispatchLearnerEvent: (event) => {
      commitLearnerEvent(event);
    },

    applyEngineResult: (result) => {
      const previous = get();
      const snapshot: AppState = {
        twin: previous.twin,
        roadmap: previous.roadmap,
        decisions: previous.decisions,
        nudges: previous.nudges,
        learnerEvents: previous.learnerEvents,
        isInitialized: previous.isInitialized,
        isHydrated: previous.isHydrated,
        demoMode: previous.demoMode,
        demoStepIndex: previous.demoStepIndex,
        flowCheckpoint: previous.flowCheckpoint,
        adaptationReveal: previous.adaptationReveal,
        mentorAutoExplain: previous.mentorAutoExplain,
        returnWelcomeMessage: previous.returnWelcomeMessage,
        engagementTimelineBaseline: previous.engagementTimelineBaseline,
        lastError: previous.lastError,
      };

      if (!snapshot.twin || !snapshot.roadmap) {
        set({ lastError: "Cannot apply engine result before initialization." });
        return;
      }

      try {
        const applied = applyEngineResult(buildEngineContext(snapshot), result);
        const decisionExists = snapshot.decisions.some(
          (decision) => decision.id === result.decision.id,
        );

        const mergedNudges = [...snapshot.nudges];
        for (const nudge of applied.nudges ?? []) {
          if (!mergedNudges.some((existing) => existing.id === nudge.id)) {
            mergedNudges.push(nudge);
          }
        }

        set({
          twin: applied.twin,
          roadmap: applied.roadmap,
          nudges: mergedNudges,
          decisions: decisionExists
            ? snapshot.decisions
            : [...snapshot.decisions, result.decision],
          lastError: null,
        });
      } catch (error) {
        set({
          twin: snapshot.twin,
          roadmap: snapshot.roadmap,
          decisions: snapshot.decisions,
          nudges: snapshot.nudges,
          learnerEvents: snapshot.learnerEvents,
          lastError: error instanceof Error ? error.message : "Failed to apply engine result.",
        });
      }
    },

    completeTask: (taskId, timestamp) => {
      const state = get();

      if (!state.twin || !state.roadmap) {
        set({ lastError: "Cannot complete a task before initialization." });
        return;
      }

      const task = state.roadmap.tasks.find((entry) => entry.id === taskId);
      if (!task) {
        set({ lastError: `Task not found: ${taskId}` });
        return;
      }

      if (task.status === "completed") {
        return;
      }

      const roadmapWithCompletion: Roadmap = {
        ...state.roadmap,
        tasks: state.roadmap.tasks.map((entry) =>
          entry.id === taskId ? { ...entry, status: "completed" } : entry,
        ),
      };

      commitLearnerEvent(
        {
          type: "TASK_COMPLETED",
          taskId,
          timestamp,
        },
        roadmapWithCompletion,
      );
    },

    resetDemo: (timestamp) => {
      get().initializeDemoLearner(timestamp);
    },

    enterDemoFromLanding: (timestamp) => {
      const state = get();

      if (isDemoInProgress(state)) {
        return;
      }

      if (isCleanDemoBaseline(state)) {
        set({
          demoStepIndex: demoEntryStepIndex,
          demoMode: true,
          flowCheckpoint: null,
          adaptationReveal: null,
          mentorAutoExplain: false,
          returnWelcomeMessage: null,
          engagementTimelineBaseline: null,
          lastError: null,
        });
        return;
      }

      set({
        twin: createDemoTwin(timestamp),
        roadmap: generateDemoRoadmap(timestamp),
        decisions: [],
        nudges: [],
        learnerEvents: [],
        demoStepIndex: demoEntryStepIndex,
        flowCheckpoint: null,
        adaptationReveal: null,
        mentorAutoExplain: false,
        returnWelcomeMessage: null,
        engagementTimelineBaseline: null,
        demoMode: true,
        isInitialized: true,
        lastError: null,
      });
    },

    completeOnboarding: (input: OnboardingInput, timestamp) => {
      const twin = createTwinFromOnboarding(input, timestamp);
      const roadmap = createRoadmapFromOnboarding(input, twin.id, timestamp);

      set({
        twin,
        roadmap,
        decisions: [],
        nudges: [],
        learnerEvents: [],
        demoStepIndex: 0,
        flowCheckpoint: null,
        adaptationReveal: null,
        mentorAutoExplain: false,
        returnWelcomeMessage: null,
        engagementTimelineBaseline: null,
        demoMode: false,
        isInitialized: true,
        lastError: null,
      });

      get().dispatchLearnerEvent({
        type: "ONBOARDING_COMPLETED",
        twin,
        timestamp,
      });
    },

    runNextDemoStep: (timestamp) => {
      const state = get();

      if (state.demoStepIndex >= demoSteps.length) {
        return;
      }

      const step = demoSteps[state.demoStepIndex];

      if (step.kind === "INITIALIZE") {
        get().initializeDemoLearner(timestamp);
      } else if (step.buildEvent) {
        get().dispatchLearnerEvent(step.buildEvent(timestamp));
      }

      set({ demoStepIndex: state.demoStepIndex + 1, lastError: null });
    },

    runAllDemoSteps: (timestamp) => {
      const state = get();
      const remaining = demoSteps.length - state.demoStepIndex;

      for (let index = 0; index < remaining; index += 1) {
        get().runNextDemoStep(timestamp);
      }
    },

    markNudgeRead: (nudgeId) => {
      set((state) => ({
        nudges: state.nudges.map((nudge) =>
          nudge.id === nudgeId ? { ...nudge, read: true } : nudge,
        ),
      }));
    },

    markFlowCheckpoint: (hint) => {
      set((state) => {
        const order = ["adapt-seen", "twin-seen", "explain-seen"] as const;
        const currentIndex = state.flowCheckpoint ? order.indexOf(state.flowCheckpoint) : -1;
        const nextIndex = order.indexOf(hint);

        if (nextIndex <= currentIndex) {
          return {};
        }

        if (nextIndex > currentIndex + 1) {
          return {};
        }

        return { flowCheckpoint: hint };
      });
    },

    clearError: () => {
      set({ lastError: null });
    },

    showAdaptationReveal: (kind, score) => {
      set({ adaptationReveal: { kind, score, visible: true } });
    },

    dismissAdaptationReveal: () => {
      set((state) =>
        state.adaptationReveal
          ? { adaptationReveal: { ...state.adaptationReveal, visible: false } }
          : {},
      );
    },

    requestMentorAutoExplain: () => {
      set({ mentorAutoExplain: true });
    },

    clearMentorAutoExplain: () => {
      set({ mentorAutoExplain: false });
    },

    acknowledgeLearnerReturn: (message) => {
      set((state) => ({
        returnWelcomeMessage: message,
        nudges: state.nudges.map((nudge) =>
          !nudge.read && (nudge.id.includes("inactivity") || /inactive/i.test(nudge.body))
            ? { ...nudge, read: true }
            : nudge,
        ),
      }));
    },

    clearReturnWelcome: () => {
      set({ returnWelcomeMessage: null });
    },

    captureEngagementTimelineBaseline: () => {
      set((state) => {
        const baseline = buildEngagementTimelineBaselineFromState(state);
        if (!baseline) {
          return {};
        }

        return { engagementTimelineBaseline: baseline };
      });
    },

    resetEngagementTimeline: () => {
      set((state) => {
        if (!state.demoMode || !state.twin || !state.roadmap) {
          return {};
        }

        const baseline = resolveEngagementTimelineBaseline(state);
        if (!baseline) {
          return {};
        }

        return {
          twin: structuredClone(baseline.twin),
          roadmap: structuredClone(baseline.roadmap),
          decisions: structuredClone(baseline.decisions),
          nudges: structuredClone(baseline.nudges),
          learnerEvents: structuredClone(baseline.learnerEvents),
          engagementTimelineBaseline: null,
          returnWelcomeMessage: null,
          lastError: null,
        };
      });
    },

    setHydrated: (value) => {
      set({ isHydrated: value });
    },
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => createAppStoreSlice(set, get),
    {
      name: appConfig.storageKeys.app,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        twin: state.twin,
        roadmap: state.roadmap,
        decisions: state.decisions,
        nudges: state.nudges,
        learnerEvents: state.learnerEvents,
        demoStepIndex: state.demoStepIndex,
        demoMode: state.demoMode,
        isInitialized: state.isInitialized,
        engagementTimelineBaseline: state.demoMode
          ? state.engagementTimelineBaseline
          : null,
      }),
      merge: (persisted, current) => {
        const validated = validatePersistedState(persisted);
        if (!validated) {
          return {
            ...current,
            isHydrated: true,
          };
        }

        return {
          ...current,
          ...validated,
          isHydrated: true,
          lastError: null,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setHydrated(true);
          state?.clearError();
          return;
        }

        state?.setHydrated(true);
      },
      skipHydration: typeof window === "undefined",
    },
  ),
);

/** Non-persisted store for deterministic unit tests. */
export function createTestAppStore() {
  return create<AppStore>()((set, get) => createAppStoreSlice(set, get));
}

export async function hydrateAppStore(): Promise<void> {
  if (typeof window !== "undefined") {
    await useAppStore.persist.rehydrate();
  }
}

export type { AppActions, AppState, AppStore } from "@/stores/store-types";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appConfig } from "@/config/app-config";
import { demoSteps } from "@/data/demo-script";
import { logDecisionEngineResult } from "@/lib/dev/architecture-log";
import { applyEngineResult } from "@/lib/engine/apply";
import { evaluate } from "@/lib/engine/index";
import {
  applyQuizSubmissionTaskCompletion,
} from "@/lib/roadmap/complete-roadmap-task";
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
import {
  logPresenterModeTransition,
  persistPresenterMode,
  readInitialPresenterMode,
  readPresenterModeFromSearch,
  resolvePresenterMode,
  resolvePresenterModeDetails,
} from "@/lib/presenter/presenter-mode";
import { clearAllJourneyCaches } from "@/lib/session/clear-journey-caches";
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

const GENERIC_PERSISTED_TOPIC_IDS = new Set([
  "foundations",
  "core-concepts",
  "basics",
  "introduction",
  "review",
  "applied-practice",
  "overview",
  "fundamentals",
  "practice",
]);

function roadmapUsesGenericTopicMajority(roadmap: Roadmap): boolean {
  const topicIds = [...new Set(roadmap.tasks.map((task) => task.topicId))];
  if (topicIds.length === 0) {
    return false;
  }

  const genericCount = topicIds.filter((topicId) => GENERIC_PERSISTED_TOPIC_IDS.has(topicId)).length;
  return genericCount >= Math.ceil(topicIds.length * 0.5);
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
    // Drop stale Foundations-style roadmaps so they cannot resurrect after curriculum fixes.
    if (roadmapUsesGenericTopicMajority(roadmapResult.data)) {
      candidate.roadmap = null;
      candidate.twin = null;
      candidate.isInitialized = false;
    } else {
      candidate.roadmap = roadmapResult.data;
    }
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
      presenterMode: previous.presenterMode,
      demoStepIndex: previous.demoStepIndex,
      flowCheckpoint: previous.flowCheckpoint,
      adaptationReveal: previous.adaptationReveal,
      mentorAutoExplain: previous.mentorAutoExplain,
      returnWelcomeMessage: previous.returnWelcomeMessage,
      engagementTimelineBaseline: previous.engagementTimelineBaseline,
      lastError: previous.lastError,
    };

    try {
      const activeRoadmap =
        roadmapOverride ??
        (snapshot.roadmap && event.type === "QUIZ_COMPLETED"
          ? applyQuizSubmissionTaskCompletion(snapshot.roadmap, event.topicId)
          : snapshot.roadmap);

      const context = buildEngineContext({
        ...snapshot,
        roadmap: activeRoadmap,
      });
      const result = evaluate(normalizedEvent, context);
      logDecisionEngineResult(normalizedEvent, result);
      const nextState = mergeEngineResultIntoState(
        snapshot,
        normalizedEvent,
        result,
        activeRoadmap ?? undefined,
      );

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
    presenterMode: readInitialPresenterMode(),

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
        presenterMode: false,
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
        presenterMode: previous.presenterMode,
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

    resetJourney: () => {
      clearAllJourneyCaches();
      const presenterMode = get().presenterMode || resolvePresenterMode(undefined, get().presenterMode);

      if (presenterMode) {
        persistPresenterMode(true);
      }

      set({
        ...initialAppState,
        isHydrated: true,
        presenterMode,
      });
    },

    setPresenterMode: (enabled) => {
      persistPresenterMode(enabled);
      set({ presenterMode: enabled });
    },

    syncPresenterMode: (search, source = "sync") => {
      const storeBefore = get().presenterMode;

      if (search && readPresenterModeFromSearch(search)) {
        persistPresenterMode(true);
      }

      const resolution = resolvePresenterModeDetails(search, storeBefore);

      if (resolution.resolved) {
        if (!storeBefore) {
          persistPresenterMode(true);
          set({ presenterMode: true });
        }

        logPresenterModeTransition({
          source,
          storeBefore,
          storeAfter: true,
          resolution,
        });
        return true;
      }

      logPresenterModeTransition({
        source,
        storeBefore,
        storeAfter: storeBefore,
        resolution,
      });
      return storeBefore;
    },

    enterDemoFromLanding: (timestamp) => {
      const state = get();

      if (isDemoInProgress(state)) {
        return;
      }

      if (isCleanDemoBaseline(state)) {
        persistPresenterMode(true);
        set({
          demoStepIndex: demoEntryStepIndex,
          presenterMode: true,
          flowCheckpoint: null,
          adaptationReveal: null,
          mentorAutoExplain: false,
          returnWelcomeMessage: null,
          engagementTimelineBaseline: null,
          lastError: null,
        });
        return;
      }

      persistPresenterMode(true);
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
        presenterMode: true,
        isInitialized: true,
        lastError: null,
      });
    },

    /** @deprecated Use `completeOnboardingWithRoadmap` after Summary confirmation. Tests only. */
    completeOnboarding: (input: OnboardingInput, timestamp) => {
      const twin = createTwinFromOnboarding(input, timestamp);
      const roadmap = createRoadmapFromOnboarding(input, twin.id, timestamp);
      const presenterMode = get().presenterMode || resolvePresenterMode(undefined, get().presenterMode);

      if (presenterMode) {
        persistPresenterMode(true);
      }

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
        presenterMode,
        isInitialized: true,
        lastError: null,
      });

      get().dispatchLearnerEvent({
        type: "ONBOARDING_COMPLETED",
        twin,
        timestamp,
      });
    },

    completeOnboardingWithRoadmap: (input: OnboardingInput, roadmap, timestamp) => {
      const twin = createTwinFromOnboarding(input, timestamp);
      const presenterMode = get().presenterMode || resolvePresenterMode(undefined, get().presenterMode);

      if (presenterMode) {
        persistPresenterMode(true);
      }

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
        presenterMode,
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
        if (!state.presenterMode || !state.twin || !state.roadmap) {
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
        isInitialized: state.isInitialized,
        engagementTimelineBaseline: state.presenterMode
          ? state.engagementTimelineBaseline
          : null,
      }),
      merge: (persisted, current) => {
        const validated = validatePersistedState(persisted);
        if (!validated) {
          const presenterMode = resolvePresenterMode(undefined, current.presenterMode);
          return {
            ...current,
            isHydrated: true,
            presenterMode: presenterMode ? true : current.presenterMode,
          };
        }

        const presenterMode = resolvePresenterMode(undefined, current.presenterMode);

        return {
          ...current,
          ...validated,
          isHydrated: true,
          lastError: null,
          presenterMode: presenterMode ? true : current.presenterMode,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setHydrated(true);
          state?.clearError();
          state?.syncPresenterMode(undefined, "rehydrate-error");
          return;
        }

        state?.setHydrated(true);
        state?.syncPresenterMode(undefined, "rehydrate");
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

// @vitest-environment jsdom

import { StrictMode } from "react";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGeneratedLesson } from "@/hooks/use-generated-lesson";
import {
  fetchGeneratedLesson,
  resetLessonFetchDedupForTests,
} from "@/lib/learn/fetch-generated-lesson";
import * as fetchGeneratedLessonModule from "@/lib/learn/fetch-generated-lesson";
import {
  readLessonFetchTimings,
  resetLessonFetchTimingsForTests,
} from "@/lib/learn/lesson-fetch-timing";
import { prefetchLessonForTopic } from "@/lib/learn/prefetch-current-lesson";
import { readCachedLesson } from "@/lib/learn/lesson-session-cache";
import type { GenerateLessonRequest } from "@/lib/learn/generate-lesson-request-schema";
import type { AppState } from "@/stores/store-types";

const LESSON_REQUEST: GenerateLessonRequest = {
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python",
  goalCategory: "Programming",
  goalType: "Skill",
  topicId: "python-basics",
  topicTitle: "Python Basics",
  skillLevel: "beginner",
  durationMinutes: 45,
  preferredFormats: ["video", "quiz"],
};

const LESSON_API_BODY = {
  source: "deterministic" as const,
  lesson: {
    topicId: LESSON_REQUEST.topicId,
    source: "deterministic" as const,
    title: "Python Basics",
    estimatedMinutes: 45,
    learningObjectives: ["Understand Python syntax"],
    sections: [
      {
        heading: "Intro",
        content: "Python intro content here.",
        practicalExample: "print('hi')",
        commonMistakes: ["Indentation errors"],
        summary: ["Use spaces consistently"],
        knowledgeCheck: [
          {
            question: "Valid assignment?",
            options: ["x = 1", "1 = x", "x := y", "x - 1"] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Left side must be variable.",
          },
        ],
      },
    ],
  },
  fallbackReason: "missing-api-key",
};

const mockStoreState = vi.hoisted(() => ({
  isHydrated: true,
  isInitialized: true,
  roadmap: { goalId: "learn-python" } as AppState["roadmap"],
  twin: {
    id: "twin-1",
    goal: {
      title: "Learn Python",
      slug: "learn-python",
      category: "Programming" as const,
      type: "Skill" as const,
      targetDate: "2026-09-01",
    },
    skillLevel: "beginner" as const,
    strengths: [],
    weaknesses: [],
    knownChallenges: [],
    preferences: {
      studyTimeOfDay: "evening" as const,
      focusDurationMinutes: 45,
      preferredFormats: ["video", "quiz"] as const,
    },
    consistencyScore: 80,
    quizHistory: [],
    lastActiveAt: "2026-07-18",
    inactivityDays: 0,
    currentStreakDays: 1,
    totalStudyMinutes: 60,
    plannedStudyMinutes: 120,
    dropoutRisk: 10,
    learningVelocity: 1,
    createdAt: "2026-07-01",
    updatedAt: "2026-07-18",
  } as AppState["twin"],
}));

const fullStoreState = vi.hoisted(() => ({
  get value() {
    return buildFullStateFromHoisted();
  },
}));

function buildFullStateFromHoisted(): AppState {
  return {
    twin: mockStoreState.twin!,
    roadmap: {
      id: "roadmap-1",
      goalId: "learn-python",
      version: 1,
      updatedAt: "2026-07-18",
      milestones: [],
      tasks: [
        {
          id: "task-1",
          milestoneId: "ms-1",
          topicId: "python-basics",
          type: "lesson",
          title: "Python Basics",
          estimatedMinutes: 45,
          priority: 1,
          status: "pending",
          unlocked: true,
        },
      ],
    },
    decisions: [],
    nudges: [],
    learnerEvents: [],
    isInitialized: mockStoreState.isInitialized,
    isHydrated: mockStoreState.isHydrated,
    presenterMode: false,
    demoStepIndex: 0,
    flowCheckpoint: null,
    adaptationReveal: null,
    mentorAutoExplain: false,
    returnWelcomeMessage: null,
    engagementTimelineBaseline: null,
    lastError: null,
  };
}

function buildFullState(): AppState {
  return fullStoreState.value;
}

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: Object.assign(
    (selector?: (state: typeof mockStoreState) => unknown) =>
      selector ? selector(mockStoreState) : mockStoreState,
    {
      getState: () => fullStoreState.value,
    },
  ),
}));

function stubDelayedFetch(delayMs = 40) {
  let fetchCount = 0;

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      fetchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return {
        ok: true,
        json: async () => LESSON_API_BODY,
      } as Response;
    }),
  );

  return {
    getFetchCount: () => fetchCount,
  };
}

describe("useGeneratedLesson", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
    resetLessonFetchTimingsForTests();
    vi.stubEnv("NODE_ENV", "development");
    mockStoreState.isHydrated = true;
    mockStoreState.isInitialized = true;
    mockStoreState.roadmap = { goalId: LESSON_REQUEST.goalId } as AppState["roadmap"];
    mockStoreState.twin = buildFullState().twin;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetLessonFetchDedupForTests();
    resetLessonFetchTimingsForTests();
  });

  it("survives Strict Mode remount and renders the shared in-flight lesson", async () => {
    const { getFetchCount } = stubDelayedFetch(80);

    const first = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));

    await waitFor(() => {
      expect(getFetchCount()).toBe(1);
    });

    first.unmount();

    const second = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId), {
      wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    });

    await waitFor(() => {
      expect(second.result.current.loading).toBe(false);
    });

    expect(second.result.current.lesson?.title).toBe("Python Basics");
    expect(second.result.current.error).toBeNull();
    expect(getFetchCount()).toBe(1);

    const timings = readLessonFetchTimings();
    expect(timings.some((event) => event.phase === "lesson-render-ready")).toBe(true);
    expect(timings.some((event) => event.phase === "lesson-loading-complete")).toBe(true);
  });

  it("joins a dashboard prefetch in flight and renders without a second API request", async () => {
    const { getFetchCount } = stubDelayedFetch(50);
    const state = buildFullState();

    const prefetchPromise = prefetchLessonForTopic(state, LESSON_REQUEST.topicId, {
      prefetchNext: false,
    });

    const { result } = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));

    await Promise.all([
      prefetchPromise,
      waitFor(() => {
        expect(result.current.loading).toBe(false);
      }),
    ]);

    expect(result.current.lesson?.title).toBe("Python Basics");
    expect(getFetchCount()).toBe(1);
  });

  it("reads a late cache hit on remount without issuing another API request", async () => {
    let fetchCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        fetchCount += 1;
        return {
          ok: true,
          json: async () => LESSON_API_BODY,
        } as Response;
      }),
    );

    const state = buildFullState();
    await prefetchLessonForTopic(state, LESSON_REQUEST.topicId, { prefetchNext: false });

    expect(readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId)?.title).toBe(
      "Python Basics",
    );

    const { result, unmount } = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));
    unmount();

    const { result: remounted } = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));

    await waitFor(() => {
      expect(remounted.current.loading).toBe(false);
    });

    expect(remounted.current.lesson?.title).toBe("Python Basics");
    expect(fetchCount).toBe(1);
  });

  it("clears loading and surfaces an error when fetch unexpectedly rejects", async () => {
    const fetchSpy = vi
      .spyOn(fetchGeneratedLessonModule, "fetchGeneratedLesson")
      .mockRejectedValueOnce(new Error("Unexpected cache write failure"));

    const { result } = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lesson).toBeNull();
    expect(result.current.error).toBe("Unexpected cache write failure");

    fetchSpy.mockRestore();
  });

  it("hydrates synchronously from session cache on first render", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("fetch should not run on cache hit");
      }),
    );

    await prefetchLessonForTopic(buildFullState(), LESSON_REQUEST.topicId, { prefetchNext: false });

    expect(readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId)?.title).toBe(
      "Python Basics",
    );

    const { result } = renderHook(() => useGeneratedLesson(LESSON_REQUEST.topicId));

    expect(result.current.loading).toBe(false);
    expect(result.current.lesson?.title).toBe("Python Basics");
  });

  it("reuses cached fallback lessons for assessment without refetching", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })) as unknown as typeof fetch,
    );

    const state = buildFullState();
    await prefetchLessonForTopic(state, LESSON_REQUEST.topicId, { prefetchNext: false });

    const cached = readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId);
    expect(cached?.source).toBe("cache");
    expect(cached?.title).toContain("Python Basics");

    const lesson = await fetchGeneratedLesson(LESSON_REQUEST);
    expect(lesson.title).toContain("Python Basics");
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});

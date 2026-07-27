// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchGeneratedLesson,
  resetLessonFetchDedupForTests,
} from "@/lib/learn/fetch-generated-lesson";
import {
  readLessonFetchTimings,
  recordStartLearningClick,
  resetLessonFetchTimingsForTests,
} from "@/lib/learn/lesson-fetch-timing";
import {
  prefetchCurrentLesson,
  prefetchLessonForTopic,
} from "@/lib/learn/prefetch-current-lesson";
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

function buildState(): AppState {
  return {
    twin: {
      id: "twin-1",
      goal: {
        title: LESSON_REQUEST.goalTitle,
        targetDate: "2026-09-01",
        slug: LESSON_REQUEST.goalSlug,
        category: "Programming",
        type: "Skill",
      },
      skillLevel: "beginner",
      strengths: [],
      weaknesses: [],
      knownChallenges: [],
      preferences: {
        studyTimeOfDay: "evening",
        focusDurationMinutes: 45,
        preferredFormats: ["video", "quiz"],
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
    },
    roadmap: {
      id: "roadmap-1",
      goalId: LESSON_REQUEST.goalId,
      version: 1,
      updatedAt: "2026-07-18",
      milestones: [
        {
          id: "ms-1",
          title: "Basics",
          order: 1,
          status: "current",
          topicIds: ["python-basics"],
          targetDate: "2026-08-01",
        },
        {
          id: "ms-2",
          title: "Functions",
          order: 2,
          status: "pending",
          topicIds: ["python-functions"],
          targetDate: "2026-08-15",
        },
      ],
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
        {
          id: "task-2",
          milestoneId: "ms-2",
          topicId: "python-functions",
          type: "lesson",
          title: "Python Functions",
          estimatedMinutes: 50,
          priority: 1,
          status: "pending",
          unlocked: true,
        },
      ],
    },
    decisions: [],
    nudges: [],
    learnerEvents: [],
    isInitialized: true,
    isHydrated: true,
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

describe("lesson prefetch", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
    resetLessonFetchTimingsForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetLessonFetchDedupForTests();
    resetLessonFetchTimingsForTests();
  });

  it("prefetches the dashboard current lesson into session cache", async () => {
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

    const state = buildState();
    prefetchCurrentLesson(state);

    await vi.waitFor(() => {
      expect(readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId)?.title).toBe(
        "Python Basics",
      );
    });

    expect(fetchCount).toBeGreaterThanOrEqual(1);
  });

  it("serves cached lesson immediately without a second API request", async () => {
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

    const state = buildState();
    await prefetchLessonForTopic(state, LESSON_REQUEST.topicId, { prefetchNext: false });

    expect(fetchCount).toBe(1);

    const cached = await fetchGeneratedLesson(LESSON_REQUEST);
    expect(cached.title).toBe("Python Basics");
    expect(fetchCount).toBe(1);
  });

  it("deduplicates overlapping prefetch and navigation requests", async () => {
    let fetchCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        fetchCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
          ok: true,
          json: async () => LESSON_API_BODY,
        } as Response;
      }),
    );

    const state = buildState();
    const prefetchPromise = prefetchLessonForTopic(state, LESSON_REQUEST.topicId, {
      prefetchNext: false,
    });
    const navigationPromise = fetchGeneratedLesson(LESSON_REQUEST);

    await Promise.all([prefetchPromise, navigationPromise]);

    expect(fetchCount).toBe(1);
  });

  it("caches deterministic fallback lessons", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })) as unknown as typeof fetch,
    );

    const state = buildState();
    await prefetchLessonForTopic(state, LESSON_REQUEST.topicId, { prefetchNext: false });

    const cached = readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId);
    expect(cached?.source).toBe("cache");
    expect(cached?.title).toContain("Python Basics");
  });

  it("records Start Learning timing markers in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    recordStartLearningClick("python-basics", "learn-python");

    const timings = readLessonFetchTimings();
    expect(timings.some((event) => event.phase === "start-learning-click")).toBe(true);
  });

  it("does not change presenter mode state during prefetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => LESSON_API_BODY,
      })) as unknown as typeof fetch,
    );

    const state = buildState();
    state.presenterMode = true;

    prefetchCurrentLesson(state);

    await vi.waitFor(() => {
      expect(readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId)).toBeTruthy();
    });

    expect(state.presenterMode).toBe(true);
  });

  it("allows assessment flow to reuse prefetched lesson cache", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => LESSON_API_BODY,
      })) as unknown as typeof fetch,
    );

    const state = buildState();
    await prefetchLessonForTopic(state, LESSON_REQUEST.topicId, { prefetchNext: false });

    const cached = readCachedLesson(LESSON_REQUEST.goalId, LESSON_REQUEST.topicId);
    expect(cached?.topicId).toBe("python-basics");
    expect(cached?.sections.length).toBeGreaterThan(0);
  });
});

describe("useLessonPrefetch hook", () => {
  it("exports a prefetch helper used by the dashboard", async () => {
    const { prefetchCurrentLesson: exportedPrefetch } = await import(
      "@/lib/learn/prefetch-current-lesson"
    );
    expect(typeof exportedPrefetch).toBe("function");
  });
});

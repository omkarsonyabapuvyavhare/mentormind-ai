// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";

const mockStoreState = vi.hoisted(() => ({
  presenterMode: true,
  isHydrated: true,
  isInitialized: true,
  twin: {
    id: "twin-1",
    goal: {
      title: "Learn Python",
      category: "Programming",
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
      learningStyle: "mixed" as const,
    },
    overallCompletionPercent: 10,
    quizHistory: [],
    currentStreakDays: 3,
    longestStreakDays: 3,
    inactivityDays: 0,
    consistencyScore: 70,
    dropoutRisk: 20,
    lastActiveAt: "2026-07-24T18:00:00.000Z",
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-24T18:00:00.000Z",
  },
  roadmap: {
    goalId: "learn-python",
    version: 1,
    milestones: [],
    tasks: [
      {
        id: "task-1",
        title: "Python Basics",
        topicId: "python-basics",
        estimatedMinutes: 45,
        status: "pending" as const,
      },
    ],
  },
  decisions: [],
  learnerEvents: [],
  nudges: [],
  flowCheckpoint: null,
  lastError: null,
  engagementTimelineBaseline: null,
  dispatchLearnerEvent: vi.fn(),
  captureEngagementTimelineBaseline: vi.fn(),
  resetEngagementTimeline: vi.fn(),
  showAdaptationReveal: vi.fn(),
  resetJourney: vi.fn(),
  syncPresenterMode: vi.fn(),
  setPresenterMode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/hooks/use-lesson-prefetch", () => ({
  useLessonPrefetch: () => undefined,
}));

vi.mock("@/hooks/use-inactivity-partner-action", () => ({
  useInactivityPartnerAction: () => vi.fn(),
}));

vi.mock("@/lib/tutor/mission", () => ({
  selectTodayMission: () => ({
    topicId: "python-basics",
    goal: "Python Basics",
    lessonHref: "/learn/python-basics",
    assessmentHref: "/assessment/python-basics",
    estimatedMinutes: 45,
  }),
}));

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: Object.assign(
    (selector?: (state: typeof mockStoreState) => unknown) =>
      selector ? selector(mockStoreState) : mockStoreState,
    { getState: () => mockStoreState },
  ),
}));

describe("Dashboard Fast Forward layout", () => {
  afterEach(() => {
    cleanup();
    mockStoreState.presenterMode = true;
    mockStoreState.decisions = [];
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "true");
    vi.clearAllMocks();
  });

  it("renders exactly one Fast Forward control when presenter mode is on, with no bottom Presenter controls panel", () => {
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "true");
    mockStoreState.presenterMode = true;

    render(<DashboardCommandCenter />);

    expect(screen.getByText("Learner Engagement")).toBeTruthy();
    expect(screen.getByText("Fast Forward Timeline")).toBeTruthy();

    const fastForwardButtons = screen.getAllByRole("button", {
      name: /Fast\s*Forward\s*3\s*Days/i,
    });
    expect(fastForwardButtons).toHaveLength(1);

    expect(screen.queryByText("Presenter controls")).toBeNull();
    expect(screen.queryByText("Hidden simulation shortcuts")).toBeNull();
  });

  it("hides Fast Forward for normal learners", () => {
    mockStoreState.presenterMode = false;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    render(<DashboardCommandCenter />);

    expect(screen.getByText("Learner Engagement")).toBeTruthy();
    expect(screen.queryByText("Fast Forward Timeline")).toBeNull();
    expect(screen.queryByRole("button", { name: /Fast\s*Forward\s*3\s*Days/i })).toBeNull();
  });
});

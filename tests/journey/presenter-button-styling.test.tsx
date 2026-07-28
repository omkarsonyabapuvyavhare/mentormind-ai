// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuizNavigation } from "@/components/assessment/quiz-navigation";
import { PresenterControls } from "@/components/presenter/presenter-controls";

const mockPathname = vi.hoisted(() => ({ value: "/assessment/python-basics" }));

const mockStoreState = vi.hoisted(() => ({
  presenterMode: true,
  isHydrated: true,
  isInitialized: true,
  twin: {
    goal: { title: "Learn Python", category: "Programming", type: "Skill" as const },
  },
  roadmap: { goalId: "learn-python", tasks: [] },
  decisions: [],
  learnerEvents: [],
  nudges: [],
  dispatchLearnerEvent: vi.fn(),
  showAdaptationReveal: vi.fn(),
  resetJourney: vi.fn(),
  syncPresenterMode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => mockPathname.value,
}));

vi.mock("@/lib/tutor/mission", () => ({
  selectTodayMission: () => ({
    topicId: "python-basics",
    goal: "Python Basics",
    lessonHref: "/learn/python-basics",
    assessmentHref: "/assessment/python-basics",
  }),
}));

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: Object.assign(
    (selector?: (state: typeof mockStoreState) => unknown) =>
      selector ? selector(mockStoreState) : mockStoreState,
    { getState: () => mockStoreState },
  ),
}));

describe("assessment action button styling", () => {
  afterEach(() => {
    cleanup();
  });

  it("styles Previous and Next with the primary cyan button variant", () => {
    const { rerender } = render(
      <QuizNavigation
        canGoPrevious={false}
        canGoNext
        isLastQuestion={false}
        onPrevious={() => {}}
        onNext={() => {}}
        onSubmit={() => {}}
        submitDisabled={false}
      />,
    );

    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });

    expect(previous.className).toContain("bg-cyan-500");
    expect(next.className).toContain("bg-cyan-500");
    expect(previous.disabled).toBe(true);

    rerender(
      <QuizNavigation
        canGoPrevious
        canGoNext
        isLastQuestion={false}
        onPrevious={() => {}}
        onNext={() => {}}
        onSubmit={() => {}}
        submitDisabled={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" }).disabled).toBe(false);
  });
});

describe("presenter control button styling", () => {
  afterEach(() => {
    cleanup();
    mockPathname.value = "/assessment/python-basics";
    vi.clearAllMocks();
  });

  it("uses primary styling for assessment score buttons", () => {
    render(<PresenterControls variant="assessment" layout="inline" />);

    expect(screen.getByRole("button", { name: /Submit 42% Score/i }).className).toContain(
      "bg-cyan-500",
    );
    expect(screen.getByRole("button", { name: /Submit 95% Score/i }).className).toContain(
      "bg-cyan-500",
    );
  });

  it("uses primary styling for Fast Forward on dashboard", () => {
    mockPathname.value = "/dashboard";
    render(<PresenterControls variant="dashboard" layout="inline" />);

    expect(screen.getByRole("button", { name: /Fast Forward 3 Days/i }).className).toContain(
      "bg-cyan-500",
    );
    expect(screen.queryByRole("button", { name: /Reset Journey/i })).toBeNull();
  });
});

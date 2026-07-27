// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PresenterControls } from "@/components/presenter/presenter-controls";

const mockStoreState = vi.hoisted(() => ({
  presenterMode: false,
  isHydrated: true,
  isInitialized: false,
  twin: null as {
    goal: { title: string; category: string; type: "Skill" };
  } | null,
  roadmap: null as { goalId: string; tasks: [] } | null,
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
  usePathname: () => "/dashboard",
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

describe("PresenterControls visibility", () => {
  afterEach(() => {
    cleanup();
    mockStoreState.presenterMode = false;
    vi.clearAllMocks();
  });

  it("is hidden for normal learners", () => {
    mockStoreState.presenterMode = false;

    const { container } = render(<PresenterControls />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("Simulate 42%")).toBeNull();
  });

  it("is visible only when presenter mode is enabled", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;

    render(<PresenterControls layout="floating" />);
    expect(screen.getByText("Simulate 42%")).toBeTruthy();
    expect(screen.getByText("Simulate 95%")).toBeTruthy();
    expect(screen.getByText("Fast Forward 3 Days")).toBeTruthy();
    expect(screen.getByText("Reset journey")).toBeTruthy();
  });

  it("dispatches INACTIVITY_TICK when Fast Forward is clicked", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;

    render(<PresenterControls layout="floating" />);
    screen.getByText("Fast Forward 3 Days").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "INACTIVITY_TICK", days: 3 }),
    );
  });
});

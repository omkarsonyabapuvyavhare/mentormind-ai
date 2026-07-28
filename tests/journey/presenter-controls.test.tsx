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
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    vi.clearAllMocks();
  });

  it("is hidden for normal learners", () => {
    mockStoreState.presenterMode = false;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    const { container } = render(<PresenterControls variant="dashboard" />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("Submit 42% Score")).toBeNull();
    expect(screen.queryByText("Fast Forward 3 Days")).toBeNull();
  });

  it("shows only dashboard controls on dashboard route", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    render(<PresenterControls variant="dashboard" layout="inline" />);
    expect(screen.getByText("Fast Forward 3 Days")).toBeTruthy();
    expect(screen.queryByText("Reset Journey")).toBeNull();
    expect(screen.queryByText("Submit 42% Score")).toBeNull();
    expect(screen.queryByText("Submit 95% Score")).toBeNull();
  });

  it("hides dashboard panel when shortcutsOnly is enabled", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;

    const { container } = render(<PresenterControls variant="dashboard" shortcutsOnly />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("Presenter controls")).toBeNull();
    expect(screen.queryByText("Hidden simulation shortcuts")).toBeNull();
    expect(screen.queryByText("Fast Forward 3 Days")).toBeNull();
  });

  it("keeps Alt+R working when shortcutsOnly hides dashboard panel", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PresenterControls variant="dashboard" shortcutsOnly />);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { altKey: true, key: "r", bubbles: true }),
    );

    expect(mockStoreState.resetJourney).toHaveBeenCalled();
  });

  it("calls resetJourney on Alt+R keyboard shortcut", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PresenterControls variant="dashboard" layout="inline" />);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { altKey: true, key: "r", bubbles: true }),
    );

    expect(mockStoreState.resetJourney).toHaveBeenCalled();
  });

  it("dispatches INACTIVITY_TICK when Fast Forward is clicked", () => {
    mockStoreState.presenterMode = true;
    mockStoreState.isInitialized = true;

    render(<PresenterControls variant="dashboard" layout="inline" />);
    screen.getByText("Fast Forward 3 Days").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "INACTIVITY_TICK", days: 3 }),
    );
  });
});

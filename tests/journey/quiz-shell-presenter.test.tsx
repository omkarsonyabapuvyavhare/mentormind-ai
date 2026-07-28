// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuizShell } from "@/components/assessment/quiz-shell";
import {
  FloatingPresenterControls,
  PresenterControls,
} from "@/components/presenter/presenter-controls";
import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import {
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";

const mockPathname = vi.hoisted(() => ({ value: "/assessment/python-basics" }));

const mockStoreState = vi.hoisted(() => ({
  presenterMode: false,
  isHydrated: true,
  isInitialized: true,
  twin: {
    goal: { title: "Learn Python", category: "Programming", type: "Skill" as const },
  },
  roadmap: { goalId: "learn-python", tasks: [] },
  decisions: [],
  learnerEvents: [],
  nudges: [],
  lastError: null,
  dispatchLearnerEvent: vi.fn(),
  showAdaptationReveal: vi.fn(),
  resetJourney: vi.fn(),
  setPresenterMode: vi.fn(),
  syncPresenterMode: vi.fn(),
}));

const assessment = buildDeterministicTopicAssessment({
  topicId: "python-basics",
  topicTitle: "Python Basics",
  goalSlug: "learn-python",
  goalCategory: "Programming",
  learningObjectives: ["Understand Python syntax"],
  sections: [
    {
      heading: "Python Basics",
      summary: ["Variables store values"],
      content: "Python uses dynamic typing.",
    },
  ],
});

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

describe("PresenterControls layouts", () => {
  afterEach(() => {
    cleanup();
    mockStoreState.presenterMode = false;
    mockPathname.value = "/assessment/python-basics";
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders only score controls inside QuizShell on assessment", () => {
    vi.stubEnv("NODE_ENV", "development");
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    render(<QuizShell assessment={assessment} />);

    expect(screen.getByText("Submit 42% Score")).toBeTruthy();
    expect(screen.getByText("Submit 95% Score")).toBeTruthy();
    expect(screen.queryByText("Fast Forward 3 Days")).toBeNull();
    expect(screen.queryByText("Reset Journey")).toBeNull();
  });

  it("hides inline controls for normal learners in QuizShell", () => {
    mockStoreState.presenterMode = false;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    render(<QuizShell assessment={assessment} />);

    expect(screen.queryByText("Submit 42% Score")).toBeNull();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("hides dashboard controls on assessment routes", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    mockPathname.value = "/assessment/python-basics";

    const { container } = render(<FloatingPresenterControls />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render floating dashboard controls", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    mockPathname.value = "/dashboard";

    const { container } = render(<FloatingPresenterControls />);
    expect(container.firstChild).toBeNull();
  });

  it("shows dashboard controls inline on dashboard route", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    mockPathname.value = "/dashboard";

    render(<PresenterControls variant="dashboard" layout="inline" />);
    expect(screen.getByText("Fast Forward 3 Days")).toBeTruthy();
    expect(screen.queryByText("Reset Journey")).toBeNull();
    expect(screen.queryByText("Submit 42% Score")).toBeNull();
  });

  it("hides dashboard controls on non-dashboard non-assessment routes", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    mockPathname.value = "/learn/python-basics";

    const { container } = render(<FloatingPresenterControls />);
    expect(container.firstChild).toBeNull();
  });

  it("shows inline assessment controls when env override is enabled", () => {
    mockStoreState.presenterMode = false;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "true");

    render(<QuizShell assessment={assessment} />);

    expect(screen.getByText("Submit 42% Score")).toBeTruthy();
    expect(screen.getByText("Submit 95% Score")).toBeTruthy();
  });

  it("runs the full analysis flow from QuizShell inline simulate", async () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    render(<QuizShell assessment={assessment} />);
    screen.getByText("Submit 42% Score").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "QUIZ_COMPLETED",
        topicId: "python-basics",
        score: PRESENTER_WEAK_SCORE,
      }),
    );
    expect(mockStoreState.showAdaptationReveal).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText("MentorMind is analyzing your learning...")).toBeTruthy();
    });
  });

  it("dispatches QUIZ_COMPLETED for inline Simulate 42% via standalone controls", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    mockPathname.value = "/assessment/python-basics";
    render(<PresenterControls variant="assessment" layout="inline" assessment={assessment} />);
    screen.getByText("Submit 42% Score").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "QUIZ_COMPLETED",
        topicId: "python-basics",
        score: PRESENTER_WEAK_SCORE,
        totalQuestions: 5,
      }),
    );
    expect(mockStoreState.showAdaptationReveal).toHaveBeenCalled();
  });

  it("dispatches QUIZ_COMPLETED for inline Simulate 95%", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    mockPathname.value = "/assessment/python-basics";
    render(<PresenterControls variant="assessment" layout="inline" assessment={assessment} />);
    screen.getByText("Submit 95% Score").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "QUIZ_COMPLETED",
        topicId: "python-basics",
        score: PRESENTER_MASTERY_SCORE,
        totalQuestions: 5,
      }),
    );
  });

  it("dispatches INACTIVITY_TICK for Fast Forward on dashboard controls", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");

    mockPathname.value = "/dashboard";
    render(<PresenterControls variant="dashboard" layout="inline" assessment={assessment} />);
    screen.getByText("Fast Forward 3 Days").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "INACTIVITY_TICK", days: 3 }),
    );
  });

  it("Alt+R still calls resetJourney on dashboard", () => {
    mockStoreState.presenterMode = true;
    vi.stubEnv("NEXT_PUBLIC_PRESENTER_MODE", "false");
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockPathname.value = "/dashboard";
    render(<PresenterControls variant="dashboard" layout="inline" />);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { altKey: true, key: "r", bubbles: true }),
    );

    expect(mockStoreState.resetJourney).toHaveBeenCalled();
  });
});

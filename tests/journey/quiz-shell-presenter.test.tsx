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

const mockPathname = vi.hoisted(() => ({ value: "/dashboard" }));

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
    mockPathname.value = "/dashboard";
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders inline controls inside QuizShell when presenter mode is enabled", () => {
    vi.stubEnv("NODE_ENV", "development");
    mockStoreState.presenterMode = true;

    render(<QuizShell assessment={assessment} />);

    expect(screen.getByText("Simulate 42%")).toBeTruthy();
    expect(screen.getByText("Simulate 95%")).toBeTruthy();
    expect(screen.getByText("Fast Forward 3 Days")).toBeTruthy();
    expect(screen.getByText("Reset journey")).toBeTruthy();
  });

  it("hides inline controls for normal learners in QuizShell", () => {
    mockStoreState.presenterMode = false;

    render(<QuizShell assessment={assessment} />);

    expect(screen.queryByText("Simulate 42%")).toBeNull();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("hides floating controls on assessment routes", () => {
    mockStoreState.presenterMode = true;
    mockPathname.value = "/assessment/python-basics";

    const { container } = render(<FloatingPresenterControls />);
    expect(container.firstChild).toBeNull();
  });

  it("shows floating controls outside assessment routes", () => {
    mockStoreState.presenterMode = true;
    mockPathname.value = "/dashboard";

    render(<FloatingPresenterControls />);
    expect(screen.getByText("Simulate 42%")).toBeTruthy();
  });

  it("runs the full analysis flow from QuizShell inline simulate", async () => {
    mockStoreState.presenterMode = true;

    render(<QuizShell assessment={assessment} />);
    screen.getByText("Simulate 42%").click();

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

    render(<PresenterControls layout="inline" assessment={assessment} />);
    screen.getByText("Simulate 42%").click();

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

    render(<PresenterControls layout="inline" assessment={assessment} />);
    screen.getByText("Simulate 95%").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "QUIZ_COMPLETED",
        topicId: "python-basics",
        score: PRESENTER_MASTERY_SCORE,
        totalQuestions: 5,
      }),
    );
  });

  it("dispatches INACTIVITY_TICK for Fast Forward", () => {
    mockStoreState.presenterMode = true;

    render(<PresenterControls layout="inline" assessment={assessment} />);
    screen.getByText("Fast Forward 3 Days").click();

    expect(mockStoreState.dispatchLearnerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "INACTIVITY_TICK", days: 3 }),
    );
  });
});

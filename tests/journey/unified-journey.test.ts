import { describe, expect, it } from "vitest";

import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { mapFocusAreasToTopicIds } from "@/lib/onboarding/map-parsed-intent";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import {
  buildPresenterQuizCompletedEvent,
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import {
  readPresenterModeFromSearch,
  resolvePresenterMode,
} from "@/lib/presenter/presenter-mode";
import { resolvePresenterAssessment } from "@/lib/presenter/resolve-presenter-assessment";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import { selectTodayMission } from "@/lib/tutor/mission";
import { initialAppState, type AppState } from "@/stores/store-types";
import {
  selectLatestDecision,
  selectNextTask,
  selectWeakTopics,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";

const START = "2026-07-17T00:00:00.000Z";
const PYTHON_GOAL =
  "I am a beginner and want to learn Python in eight weeks. I can study six hours per week and prefer practical exercises.";

function buildPythonLesson(topicId: string): GeneratedLessonPayload {
  return {
    topicId,
    source: "deterministic",
    title: "Python Basics",
    estimatedMinutes: 45,
    learningObjectives: ["Understand Python syntax", "Write simple scripts"],
    sections: [
      {
        heading: "Variables",
        content: "Python variables store values for later use.",
        practicalExample: "name = 'MentorMind'",
        commonMistakes: ["Using reserved keywords"],
        summary: ["Use descriptive names"],
        knowledgeCheck: [
          {
            question: "Which assigns a value in Python?",
            options: ["x = 1", "1 = x", "x := one", "assign x 1"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Assignment uses variable on the left.",
          },
        ],
      },
      {
        heading: "Control flow",
        content: "Use if and else to branch logic.",
        practicalExample: "if score >= 70: print('pass')",
        commonMistakes: ["Missing indentation"],
        summary: ["Indentation defines blocks"],
        knowledgeCheck: [
          {
            question: "What defines a Python block?",
            options: ["Indentation", "Braces", "Semicolons", "Parentheses"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Python uses indentation.",
          },
        ],
      },
    ],
  };
}

function buildConfirmedInput(goalText: string) {
  const parsed = parseGoalIntentDeterministic(goalText)!;
  const draft = createDraftFromParsedIntent(parsed, goalText);
  draft.skillLevel = { value: parsed.currentSkillLevel, source: "manual" };
  draft.skillLevelConfirmed = true;
  return draftToOnboardingInput(draft);
}

function buildPythonLearnerState() {
  const parsed = parseGoalIntentDeterministic(PYTHON_GOAL)!;
  const draft = createDraftFromParsedIntent(parsed, PYTHON_GOAL);
  draft.skillLevel = { value: "beginner", source: "manual" };
  draft.skillLevelConfirmed = true;
  const input = draftToOnboardingInput(draft);
  const twin = createTwinFromOnboarding(input, START);
  const { roadmap } = createDeterministicRoadmapFromOnboarding(input, twin.id, START, {
    goal: input.goalTitle,
    recommendedFocusAreas: inferFocusAreas(input.goalTitle, input.goalCategory),
  });

  return {
    ...initialAppState,
    isInitialized: true,
    isHydrated: true,
    presenterMode: false,
    twin,
    roadmap,
  };
}

function stateText(state: AppState): string {
  return JSON.stringify(state).toLowerCase();
}

describe("unified learner journey", () => {
  it("parses Python onboarding goal without AWS contamination", () => {
    const parsed = parseGoalIntentDeterministic(PYTHON_GOAL)!;
    const draft = createDraftFromParsedIntent(parsed, PYTHON_GOAL);

    expect(draft.goalSlug).toContain("python");
    expect(draft.skillLevel).toBeNull();
    expect(draft.knownChallengeTopicIds.value).toEqual([]);
    expect(draft.recommendedFocusAreas.join(" ")).not.toMatch(/vpc|aws|amazon/);
  });

  it("builds Python roadmap, mission, lesson assessment, and engine adaptation", () => {
    const store = createTestAppStore();
    const state = buildPythonLearnerState();
    store.setState({
      ...state,
      twin: state.twin!,
      roadmap: state.roadmap!,
    });

    const mission = selectTodayMission(store.getState());
    const topicId = mission.topicId;

    expect(topicId).toBeTruthy();
    expect(mission.goal.toLowerCase()).toContain("python");
    expect(stateText(store.getState())).not.toMatch(/\bvpc\b|\baws\b|\bamazon\b|\bazure\b/);

    const lesson = buildPythonLesson(topicId);
    const assessment = buildAssessmentFromLesson(lesson, {
      goalSlug: state.roadmap!.goalId,
      goalCategory: state.twin!.goal.category,
    });

    expect(assessment.topicId).toBe(topicId);
    expect(assessment.questions.length).toBeGreaterThan(0);

    const weakEvent = buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START);
    expect(weakEvent.topicId).toBe(topicId);

    store.getState().dispatchLearnerEvent(weakEvent);

    const afterWeak = store.getState();
    expect(selectWeakTopics(afterWeak).some((topic) => topic.topicId === topicId)).toBe(true);
    expect(selectLatestDecision(afterWeak)?.reasons).toContain("QUIZ_BELOW_THRESHOLD");
    expect(afterWeak.roadmap!.tasks.some((task) => task.injectedBy)).toBe(true);

    const masteryEvent = buildPresenterQuizCompletedEvent(
      assessment,
      PRESENTER_MASTERY_SCORE,
      "2026-07-24T18:00:00.000Z",
    );
    store.getState().dispatchLearnerEvent(masteryEvent);

    const afterMastery = store.getState();
    expect(selectLatestDecision(afterMastery)?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
  });

  it("smoke tests Azure AZ-900 and Kubernetes journeys without cross-domain contamination", () => {
    for (const goalText of [
      "Prepare for Azure AZ-900 in six weeks",
      "I want to learn Kubernetes as a beginner",
    ]) {
      const parsed = parseGoalIntentDeterministic(goalText)!;
      const input = buildConfirmedInput(goalText);
      const twin = createTwinFromOnboarding(input, START);
      const { roadmap } = createDeterministicRoadmapFromOnboarding(input, twin.id, START, {
        goal: input.goalTitle,
        recommendedFocusAreas: inferFocusAreas(input.goalTitle, input.goalCategory),
      });

      const mission = selectTodayMission({
        ...initialAppState,
        isInitialized: true,
        twin,
        roadmap,
      });

      expect(mission.topicId).toBeTruthy();
      expect(mission.assessmentHref).toContain(mission.topicId);
      expect(mission.goal.toLowerCase()).not.toMatch(/\bvpc\b|\baws\b|\bamazon\b/);
      expect(input.goalTitle.toLowerCase()).not.toMatch(/\bvpc\b/);
    }
  });

  it("completes journey through deterministic fallbacks when lesson generation fails", () => {
    const state = buildPythonLearnerState();
    const topicId = selectNextTask(state)!.topicId;

    const assessment = buildDeterministicTopicAssessment({
      topicId,
      topicTitle: "Python Basics",
      goalSlug: state.roadmap!.goalId,
      goalCategory: state.twin!.goal.category,
      learningObjectives: ["Understand Python syntax"],
      sections: [
        {
          heading: "Python Basics",
          summary: ["Variables store values"],
          content: "Python uses dynamic typing.",
        },
      ],
    });

    expect(assessment.source).toBe("fallback");
    expect(assessment.questions.length).toBeGreaterThan(0);
    expect(assessment.topicId).toBe(topicId);
  });

  it("uses goal-aware challenge chips instead of AWS-only topics", () => {
    const parsed = parseGoalIntentDeterministic(PYTHON_GOAL)!;
    const draft = createDraftFromParsedIntent(parsed, PYTHON_GOAL);
    const focusAreas = inferFocusAreas(draft.goalTitle, draft.goalCategory);
    const topicIds = mapFocusAreasToTopicIds(focusAreas, draft.goalSlug);

    expect(focusAreas.some((area) => /python/i.test(area))).toBe(true);
    expect(topicIds.join(" ")).not.toMatch(/vpc-networking|ec2-compute|s3-storage/);
  });
});

describe("presenter mode activation", () => {
  it("activates via query parameter helper", () => {
    expect(readPresenterModeFromSearch("?presenter=true")).toBe(true);
    expect(readPresenterModeFromSearch("?presenter=false")).toBe(false);
    expect(resolvePresenterMode("?presenter=true")).toBe(true);
  });
});

describe("presenter simulation and reset", () => {
  it("dispatches presenter 42% and 100% through the decision engine for the current topic", () => {
    const store = createTestAppStore();
    store.setState(buildPythonLearnerState());

    const mission = selectTodayMission(store.getState());
    const lesson = buildPythonLesson(mission.topicId);
    const assessment = buildAssessmentFromLesson(lesson, {
      goalSlug: store.getState().roadmap!.goalId,
      goalCategory: store.getState().twin!.goal.category,
    });

    const weakEvent = buildPresenterQuizCompletedEvent(
      assessment,
      PRESENTER_WEAK_SCORE,
      START,
    );
    store.getState().dispatchLearnerEvent(weakEvent);
    expect(weakEvent.topicId).toBe(mission.topicId);
    expect(selectLatestDecision(store.getState())?.eventType).toBe("QUIZ_COMPLETED");

    const masteryEvent = buildPresenterQuizCompletedEvent(
      assessment,
      PRESENTER_MASTERY_SCORE,
      "2026-07-24T18:00:00.000Z",
    );
    store.getState().dispatchLearnerEvent(masteryEvent);
    expect(masteryEvent.topicId).toBe(mission.topicId);
    expect(selectLatestDecision(store.getState())?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
  });

  it("reset journey clears learner state while preserving presenter mode", () => {
    const store = createTestAppStore();
    store.setState({ ...buildPythonLearnerState(), presenterMode: true });

    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(
        buildDeterministicTopicAssessment({
          topicId: selectNextTask(store.getState())!.topicId,
          topicTitle: "Python Basics",
          goalSlug: store.getState().roadmap!.goalId,
          goalCategory: store.getState().twin!.goal.category,
          learningObjectives: ["Understand Python syntax"],
          sections: [
            {
              heading: "Python Basics",
              summary: ["Variables store values"],
              content: "Python uses dynamic typing.",
            },
          ],
        }),
        PRESENTER_WEAK_SCORE,
        START,
      ),
    );

    expect(store.getState().decisions.length).toBeGreaterThan(0);

    store.getState().resetJourney();

    const reset = store.getState();
    expect(reset.twin).toBeNull();
    expect(reset.roadmap).toBeNull();
    expect(reset.decisions).toHaveLength(0);
    expect(reset.learnerEvents).toHaveLength(0);
    expect(reset.presenterMode).toBe(true);
    expect(reset.isInitialized).toBe(false);
  });
});

describe("resolvePresenterAssessment", () => {
  it("builds assessment from deterministic fallback for the current mission topic", () => {
    const state = buildPythonLearnerState();
    const assessment = resolvePresenterAssessment(state);

    expect(assessment).not.toBeNull();
    expect(assessment!.topicId).toBe(selectTodayMission(state).topicId);
  });
});

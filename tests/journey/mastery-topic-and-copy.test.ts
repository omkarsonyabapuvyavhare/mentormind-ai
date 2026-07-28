import { describe, expect, it } from "vitest";

import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import { selectAssessmentReasoningSummary } from "@/lib/ai/reasoning-summary";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { formatTopicTitle } from "@/lib/format/topic-title";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import {
  buildPresenterQuizCompletedEvent,
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import { selectPlanUpdateSummary } from "@/lib/tutor/feedback";
import { selectTodayMission } from "@/lib/tutor/mission";
import {
  resolveActiveAssessmentTopicId,
  resolveTopicDisplayName,
} from "@/lib/learner/resolve-topic-display-name";
import { createTestAppStore } from "@/stores/use-app-store";
import { initialAppState } from "@/stores/store-types";
import { selectLatestDecision } from "@/stores/selectors";

const START = "2026-07-17T00:00:00.000Z";

function buildLearnerState(goalText: string) {
  const parsed = parseGoalIntentDeterministic(goalText)!;
  const draft = createDraftFromParsedIntent(parsed, goalText);
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
    twin,
    roadmap,
  };
}

function buildMissionAssessment(state: { twin: ReturnType<typeof buildLearnerState>["twin"]; roadmap: ReturnType<typeof buildLearnerState>["roadmap"] }) {
  const mission = selectTodayMission(state);
  return buildDeterministicTopicAssessment({
    topicId: mission.topicId,
    topicTitle: formatTopicTitle(mission.topicId),
    goalSlug: state.roadmap!.goalId,
    goalCategory: state.twin!.goal.category,
    learningObjectives: ["Understand core concepts"],
    sections: [
      {
        heading: "Foundations",
        summary: ["Key idea"],
        content: "Practice concept application.",
      },
    ],
  });
}

describe("mastery topic resolution and goal-aware copy", () => {
  it("uses active Kubernetes assessment topic in presenter 95% payload", () => {
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    const assessment = buildMissionAssessment(state);
    const event = buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, START);

    expect(event.topicId).toBe(assessment.topicId);
    expect(event.totalQuestions).toBe(5);
    expect(event.masteredConceptTags).toBeDefined();
    expect(event.weakConceptTags).toBeDefined();
  });

  it("moves current assessment topic to strengths after 42% then 95% for Kubernetes", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    store.setState(state);

    const assessment = buildMissionAssessment(store.getState());
    const weakEvent = buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START);
    store.getState().dispatchLearnerEvent(weakEvent);

    const masteryEvent = buildPresenterQuizCompletedEvent(
      assessment,
      PRESENTER_MASTERY_SCORE,
      "2026-07-24T18:00:00.000Z",
    );
    store.getState().dispatchLearnerEvent(masteryEvent);

    const after = store.getState();
    const latestDecision = selectLatestDecision(after);
    expect(latestDecision?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
    expect(
      latestDecision?.actions.some(
        (action) => action.action === "MARK_STRENGTH" && action.topicId === assessment.topicId,
      ),
    ).toBe(true);
    expect(after.twin?.strengths.some((topic) => topic.topicId === assessment.topicId)).toBe(true);
    expect(after.twin?.weaknesses.some((topic) => topic.topicId === assessment.topicId)).toBe(false);
    expect(
      after.roadmap?.tasks.some(
        (task) =>
          task.topicId === assessment.topicId &&
          (task.type === "revision" || task.type === "lab") &&
          task.status === "pending" &&
          task.injectedBy !== undefined,
      ),
    ).toBe(false);
  });

  it("does not recover stale unrelated weakness during Kubernetes mastery", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    store.setState({
      ...state,
      twin: {
        ...state.twin!,
        weaknesses: [
          ...state.twin!.weaknesses,
          {
            topicId: "vpc-networking",
            topicName: "VPC Networking",
            score: 40,
            lastAssessedAt: START,
          },
        ],
      },
    });

    const assessment = buildMissionAssessment(store.getState());
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START),
    );
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-24T18:00:00.000Z"),
    );

    const after = store.getState();
    expect(after.twin?.strengths.some((entry) => entry.topicId === assessment.topicId)).toBe(true);
    expect(after.twin?.weaknesses.some((entry) => entry.topicId === "vpc-networking")).toBe(true);
  });

  it("prefers roadmap task title over twin names and never falls back to VPC", () => {
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    const topicId = "cluster-architecture";
    const roadmap = {
      ...state.roadmap!,
      tasks: state.roadmap!.tasks.map((task) =>
        task.topicId === topicId
          ? { ...task, title: "Kubernetes Cluster Architecture — Core Lesson" }
          : task,
      ),
    };
    const twin = {
      ...state.twin!,
      weaknesses: [
        {
          topicId,
          topicName: "Cluster Architecture",
          score: 42,
          lastAssessedAt: START,
        },
        {
          topicId: "vpc-networking",
          topicName: "VPC Networking",
          score: 40,
          lastAssessedAt: START,
        },
      ],
    };

    expect(resolveTopicDisplayName({ twin, roadmap }, topicId)).toBe("Kubernetes Cluster Architecture");
  });

  it("uses formatted topicId when roadmap and twin have no matching label", () => {
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    expect(resolveTopicDisplayName(state, "custom-topic-id")).toBe("Custom Topic Id");
  });

  it("shows roadmap task title on mastery updated plan for cluster-architecture", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    const topicId = "cluster-architecture";
    store.setState({
      ...state,
      roadmap: {
        ...state.roadmap!,
        tasks: state.roadmap!.tasks.map((task) =>
          task.topicId === topicId
            ? { ...task, title: "Kubernetes Cluster Architecture — Knowledge Check" }
            : task,
        ),
      },
    });

    const assessment = buildMissionAssessment(store.getState());
    expect(assessment.topicId).toBe(topicId);
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START),
    );
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-24T18:00:00.000Z"),
    );

    expect(resolveActiveAssessmentTopicId(store.getState())).toBe(topicId);
    const summary = selectPlanUpdateSummary(store.getState(), "mastery");
    expect(summary.highlights).toContain("Kubernetes Cluster Architecture moved to your strengths");
    expect(summary.highlights.join(" ")).not.toMatch(/VPC Networking/i);
  });

  it("skill-goal mastery summary never uses VPC/AWS/exam wording for Kubernetes", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    store.setState(state);
    const assessment = buildMissionAssessment(store.getState());
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START),
    );
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-24T18:00:00.000Z"),
    );

    const summary = selectPlanUpdateSummary(store.getState(), "mastery");
    const rendered = `${summary.body} ${summary.highlights.join(" ")}`.toLowerCase();
    expect(rendered).toContain("cluster architecture");
    expect(rendered).toContain("advanced kubernetes content unlocked");
    expect(rendered).not.toMatch(/\bvpc\b|\baws\b|exam|certification/);
  });

  it("skill-goal weakness summary never uses exam/certification wording", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Kubernetes in 8 weeks.");
    store.setState(state);
    const assessment = buildMissionAssessment(store.getState());
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START),
    );

    const summary = selectPlanUpdateSummary(store.getState(), "weakness");
    const rendered = `${summary.body} ${summary.highlights.join(" ")}`.toLowerCase();
    expect(rendered).toContain("learning goal");
    expect(rendered).not.toMatch(/exam|certification/);
  });

  it("python skill mastery summary never uses VPC/AWS wording", () => {
    const store = createTestAppStore();
    const state = buildLearnerState("I want to learn Python in 8 weeks.");
    store.setState(state);
    const assessment = buildMissionAssessment(store.getState());
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, START),
    );
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-24T18:00:00.000Z"),
    );

    const summary = selectPlanUpdateSummary(store.getState(), "mastery");
    const rendered = `${summary.body} ${summary.highlights.join(" ")}`.toLowerCase();
    expect(rendered).toContain("advanced python content unlocked");
    expect(rendered).not.toMatch(/\bvpc\b|\baws\b/);
  });

  it("certification goals can still use exam-oriented wording", () => {
    const state = buildLearnerState("Prepare for AWS SAA-C03 certification in 8 weeks.");
    const summary = selectAssessmentReasoningSummary(state, PRESENTER_MASTERY_SCORE);
    expect(summary.expectedBenefit.toLowerCase()).toMatch(/exam/);
  });
});

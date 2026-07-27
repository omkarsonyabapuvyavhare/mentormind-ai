import { describe, expect, it } from "vitest";

import { demoInitialNextTaskId } from "@/constants/demo";
import { routes } from "@/constants/routes";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import {
  EMPTY_MISSION_TITLE,
  resolveAssessmentHref,
  selectMissionTopicId,
  selectTodayMission,
} from "@/lib/tutor/mission";
import { getAwsSeedLessonContent, getLessonContent } from "@/data/lesson-content";
import { selectNextTask } from "@/stores/selectors";
import { initialAppState } from "@/stores/store-types";
import { createTestAppStore } from "@/stores/use-app-store";
import type { AppState } from "@/stores/store-types";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { buildTestOnboardingInput } from "../helpers/onboarding-input";

const START = "2026-07-17T00:00:00.000Z";

function buildLearnerState(
  input: OnboardingInput,
  context?: { goal?: string; recommendedFocusAreas?: string[] },
): AppState {
  const twin = createTwinFromOnboarding(input, START);
  const { roadmap } = createDeterministicRoadmapFromOnboarding(input, twin.id, START, context);

  return {
    ...initialAppState,
    isInitialized: true,
    isHydrated: true,
    presenterMode: false,
    twin,
    roadmap,
  };
}

function missionText(mission: ReturnType<typeof selectTodayMission>): string {
  return JSON.stringify(mission).toLowerCase();
}

describe("selectTodayMission roadmap source of truth", () => {
  it("shows the Python next roadmap task without VPC or AWS text", () => {
    const state = buildLearnerState(
      buildTestOnboardingInput({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
        durationWeeks: 12,
      }),
      {
        goal: "Learn Python",
        recommendedFocusAreas: inferFocusAreas("Learn Python", "Programming"),
      },
    );

    const nextTask = selectNextTask(state);
    const mission = selectTodayMission(state);

    expect(nextTask).not.toBeNull();
    expect(mission.goal).toBe(nextTask!.title);
    expect(mission.topicId).toBe(nextTask!.topicId);
    expect(mission.estimatedMinutes).toBe(nextTask!.estimatedMinutes);
    expect(mission.lessonHref).toBe(routes.lesson(nextTask!.topicId));
    expect(mission.assessmentHref).toBe(routes.assessmentTopic(nextTask!.topicId));
    expect(missionText(mission)).not.toContain("vpc");
    expect(missionText(mission)).not.toContain("aws");
    expect(missionText(mission)).not.toContain("amazon");
  });

  it("shows the React next roadmap task without AWS or Azure text", () => {
    const state = buildLearnerState(
      buildTestOnboardingInput({
        goalSlug: "learn-react",
        goalTitle: "Learn React",
        goalCategory: "Web Development",
        goalType: "Skill",
      }),
      {
        goal: "Learn React",
        recommendedFocusAreas: inferFocusAreas("Learn React", "Web Development"),
      },
    );

    const nextTask = selectNextTask(state);
    const mission = selectTodayMission(state);

    expect(mission.goal).toBe(nextTask!.title);
    expect(missionText(mission)).not.toContain("vpc");
    expect(missionText(mission)).not.toContain("aws");
    expect(missionText(mission)).not.toContain("azure");
  });

  it("uses Kubernetes roadmap topic for lesson and assessment hrefs", () => {
    const state = buildLearnerState(
      buildTestOnboardingInput({
        goalSlug: "learn-kubernetes",
        goalTitle: "Learn Kubernetes",
        goalCategory: "DevOps",
        goalType: "Skill",
      }),
      {
        goal: "Learn Kubernetes",
        recommendedFocusAreas: inferFocusAreas("Learn Kubernetes", "DevOps"),
      },
    );

    const nextTask = selectNextTask(state)!;
    const mission = selectTodayMission(state);

    expect(mission.topicId).toBe(nextTask.topicId);
    expect(mission.lessonHref).toBe(`/learn/${nextTask.topicId}`);
    expect(mission.assessmentHref).toBe(`/assessment/${nextTask.topicId}`);
  });

  it("builds expected outcome from learning objectives when available", () => {
    const state = buildLearnerState(
      buildTestOnboardingInput({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
      }),
      {
        goal: "Learn Python",
        recommendedFocusAreas: inferFocusAreas("Learn Python", "Programming"),
      },
    );

    const nextTask = selectNextTask(state)!;
    state.roadmap = {
      ...state.roadmap!,
      tasks: state.roadmap!.tasks.map((task) =>
        task.id === nextTask.id
          ? {
              ...task,
              title: "Python Basics and Variables",
              learningObjectives: [
                "Understand Python variables and primitive data types",
                "Write basic expressions and print output",
              ],
            }
          : task,
      ),
    };

    const mission = selectTodayMission(state);

    expect(mission.goal).toBe("Python Basics and Variables");
    expect(mission.expectedOutcome.toLowerCase()).toContain("python variables");
    expect(mission.expectedOutcome.toLowerCase()).toContain("primitive data types");
  });

  it("returns a neutral empty state when no unlocked pending task exists", () => {
    const state = buildLearnerState(
      buildTestOnboardingInput({
        goalSlug: "learn-python",
        goalTitle: "Learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
      }),
    );

    state.roadmap = {
      ...state.roadmap!,
      tasks: state.roadmap!.tasks.map((task) => ({ ...task, unlocked: false })),
    };

    const mission = selectTodayMission(state);

    expect(selectMissionTopicId(state)).toBeNull();
    expect(mission.goal).toBe(EMPTY_MISSION_TITLE);
    expect(mission.expectedOutcome).toContain(
      "Review your roadmap or complete the current milestone to continue",
    );
    expect(mission.lessonHref).toBe(routes.roadmap);
    expect(mission.assessmentHref).toBeNull();
    expect(missionText(mission)).not.toContain("vpc");
    expect(missionText(mission)).not.toContain("aws");
  });
});

describe("selectTodayMission legacy demo learner", () => {
  it("uses roadmap task like universal learners without VPC assessment shortcut", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);

    const state = store.getState();
    const mission = selectTodayMission(state);

    expect(state.presenterMode).toBe(false);
    expect(selectNextTask(state)?.id).toBe(demoInitialNextTaskId);
    expect(mission.goal).toBe("VPC Networking Lab");
    expect(mission.topicId).toBe("vpc-networking");
    expect(mission.assessmentHref).toBe(routes.assessmentTopic("vpc-networking"));
    expect(resolveAssessmentHref(state, "vpc-networking")).toBe(
      routes.assessmentTopic("vpc-networking"),
    );
  });
});

describe("getLessonContent", () => {
  it("returns null for unknown universal topic ids", () => {
    expect(getLessonContent("python-basics")).toBeNull();
    expect(getLessonContent("learn-react-components")).toBeNull();
  });

  it("returns AWS seed content only for known seed topics", () => {
    expect(getLessonContent("vpc-networking")?.title).toBe(
      "VPC Subnets, Route Tables, and Gateways",
    );
    expect(getLessonContent("cloud-foundations")?.title).toBe("AWS Global Infrastructure Overview");
  });

  it("keeps VPC fallback inside getAwsSeedLessonContent for demo legacy usage", () => {
    expect(getAwsSeedLessonContent("python-basics").title).toBe(
      "VPC Subnets, Route Tables, and Gateways",
    );
  });
});

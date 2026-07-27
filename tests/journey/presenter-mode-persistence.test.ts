// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import { onboardingInputSchema } from "@/lib/onboarding/schema";
import {
  persistPresenterMode,
  readInitialPresenterMode,
  resolvePresenterMode,
} from "@/lib/presenter/presenter-mode";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";
const PYTHON_GOAL =
  "I am a beginner and want to learn Python in eight weeks. I can study six hours per week and prefer practical exercises.";

function buildOnboardingInput() {
  const parsed = parseGoalIntentDeterministic(PYTHON_GOAL)!;
  const draft = createDraftFromParsedIntent(parsed, PYTHON_GOAL);
  draft.skillLevel = { value: "beginner", source: "manual" };
  draft.skillLevelConfirmed = true;
  return draftToOnboardingInput(draft);
}

function buildRoadmap(input: ReturnType<typeof buildOnboardingInput>, twinId: string) {
  return createDeterministicRoadmapFromOnboarding(input, twinId, START, {
    goal: input.goalTitle,
    recommendedFocusAreas: inferFocusAreas(input.goalTitle, input.goalCategory),
  }).roadmap;
}

describe("presenter mode persistence across learner journey", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.stubGlobal("location", {
      ...window.location,
      search: "",
      pathname: "/onboarding",
    });
  });

  it("A. activates presenter mode from ?presenter=true URL", () => {
    const store = createTestAppStore();

    const enabled = store.getState().syncPresenterMode("?presenter=true", "test:url");

    expect(enabled).toBe(true);
    expect(store.getState().presenterMode).toBe(true);
    expect(window.sessionStorage.getItem("mentormind-presenter-mode")).toBe("true");
  });

  it("B. completeOnboardingWithRoadmap preserves presenter mode", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);
    store.getState().syncPresenterMode(undefined, "test:pre-onboarding");

    const input = buildOnboardingInput();
    const twin = createTwinFromOnboarding(input, START);
    const roadmap = buildRoadmap(input, twin.id);

    store.getState().completeOnboardingWithRoadmap(input, roadmap, START);

    expect(store.getState().presenterMode).toBe(true);
    expect(store.getState().isInitialized).toBe(true);
  });

  it("B2. completeOnboarding preserves presenter mode from sessionStorage", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);

    const input = onboardingInputSchema.parse({
      goalSlug: "learn-python",
      goalTitle: "Learn Python",
      goalCategory: "Programming",
      goalType: "Skill",
      goalId: "learn-python",
      skillLevel: "beginner",
      durationWeeks: 8,
      studyHoursPerWeek: 7,
      studyTimeOfDay: "evening",
      focusDurationMinutes: 45,
      preferredFormats: ["video", "quiz"],
      knownChallengeTopicIds: [],
    });

    store.getState().completeOnboarding(input, START);

    expect(store.getState().presenterMode).toBe(true);
  });

  it("C. dashboard-style sync keeps presenter mode after onboarding", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);

    const input = buildOnboardingInput();
    const twin = createTwinFromOnboarding(input, START);
    const roadmap = buildRoadmap(input, twin.id);
    store.getState().completeOnboardingWithRoadmap(input, roadmap, START);

    store.getState().syncPresenterMode(undefined, "bootstrap:/dashboard");

    expect(store.getState().presenterMode).toBe(true);
  });

  it("D. lesson route sync keeps presenter mode", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);
    store.getState().syncPresenterMode(undefined, "bootstrap:/learn/foundations");

    expect(store.getState().presenterMode).toBe(true);
    expect(resolvePresenterMode(undefined, store.getState().presenterMode)).toBe(true);
  });

  it("E. assessment route sync keeps presenter mode", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);

    store.getState().syncPresenterMode(undefined, "assessment-view:foundations");

    expect(store.getState().presenterMode).toBe(true);
  });

  it("F. hydration race: sessionStorage true wins over store false", () => {
    const store = createTestAppStore();
    expect(store.getState().presenterMode).toBe(false);

    persistPresenterMode(true);

    const enabled = store.getState().syncPresenterMode(undefined, "rehydrate");

    expect(enabled).toBe(true);
    expect(store.getState().presenterMode).toBe(true);
  });

  it("F2. readInitialPresenterMode reads URL on first store slice load", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "?presenter=true",
      pathname: "/onboarding",
    });

    expect(readInitialPresenterMode()).toBe(true);
  });

  it("G. normal learner without presenter flag stays false", () => {
    const store = createTestAppStore();

    store.getState().syncPresenterMode(undefined, "bootstrap:/onboarding");
    store.getState().syncPresenterMode(undefined, "bootstrap:/dashboard");

    expect(store.getState().presenterMode).toBe(false);
    expect(window.sessionStorage.getItem("mentormind-presenter-mode")).toBeNull();
  });

  it("H. resetJourney preserves presenter mode from store and sessionStorage", () => {
    const store = createTestAppStore();
    persistPresenterMode(true);
    store.getState().syncPresenterMode(undefined, "test:setup");

    const input = buildOnboardingInput();
    const twin = createTwinFromOnboarding(input, START);
    const roadmap = buildRoadmap(input, twin.id);
    store.getState().completeOnboardingWithRoadmap(input, roadmap, START);

    store.getState().resetJourney();

    expect(store.getState().presenterMode).toBe(true);
    expect(window.sessionStorage.getItem("mentormind-presenter-mode")).toBe("true");
  });

  it("H2. resetJourney preserves presenter mode when only sessionStorage is set", () => {
    persistPresenterMode(true);

    const store = createTestAppStore();
    store.setState({
      presenterMode: false,
      isInitialized: true,
    });

    store.getState().resetJourney();

    expect(store.getState().presenterMode).toBe(true);
  });

  it("never downgrades in-memory presenter mode on route sync", () => {
    const store = createTestAppStore();
    store.setState({ presenterMode: true });

    store.getState().syncPresenterMode(undefined, "bootstrap:/assessment/foundations");

    expect(store.getState().presenterMode).toBe(true);
  });
});

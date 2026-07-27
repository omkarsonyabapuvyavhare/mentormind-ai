import { describe, expect, it, vi } from "vitest";

import {
  createDraftFromParsedIntent,
  createManualOnboardingDraft,
  draftToOnboardingInput,
  formatFieldSourceLabel,
  goalTypeDisplayLabel,
  isDraftStepValid,
  UI_ONBOARDING_DEFAULTS,
} from "@/lib/onboarding/onboarding-draft";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import { formatIntentSuccessSummary } from "@/lib/onboarding/format-intent-success";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { mapFocusAreasToTopicIds } from "@/lib/onboarding/map-parsed-intent";

const PYTHON_SIMPLE = "I want to learn Python";
const PYTHON_DETAILED =
  "I am a beginner and want to learn Python in eight weeks. I can study six hours per week.";

describe("onboarding confirmation flow", () => {
  it("parses Python goal as Skill without finalizing skill level or roadmap inputs", () => {
    const parsed = parseGoalIntentDeterministic(PYTHON_SIMPLE)!;
    const draft = createDraftFromParsedIntent(parsed, PYTHON_SIMPLE);
    const summary = formatIntentSuccessSummary(parsed);

    expect(parsed.goalType).toBe("Skill");
    expect(summary.goalTypeLabel).toBe("Learning goal");
    expect(summary.goalTypeLabel).not.toBe("Certification");
    expect(draft.skillLevel).toBeNull();
    expect(draft.skillLevelConfirmed).toBe(false);
    expect(draft.durationWeeks.source).toBe("default");
    expect(draft.studyHoursPerWeek.source).toBe("default");
    expect(draft.durationWeeks.value).toBe(UI_ONBOARDING_DEFAULTS.durationWeeks);
    expect(draft.studyHoursPerWeek.value).toBe(UI_ONBOARDING_DEFAULTS.studyHoursPerWeek);
    expect(isDraftStepValid(draft, 4)).toBe(false);
  });

  it("does not silently finalize 12-week or 7-hour values for vague Python goals", () => {
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic(PYTHON_SIMPLE)!,
      PYTHON_SIMPLE,
    );

    expect(draft.durationWeeks).toEqual({
      value: UI_ONBOARDING_DEFAULTS.durationWeeks,
      source: "default",
    });
    expect(draft.studyHoursPerWeek).toEqual({
      value: UI_ONBOARDING_DEFAULTS.studyHoursPerWeek,
      source: "default",
    });
    expect(draft.durationWeeks.value).not.toBe(12);
    expect(draft.studyHoursPerWeek.value).not.toBe(7);
  });

  it("prefills explicit beginner, duration, and hours when stated in the prompt", () => {
    const parsed = parseGoalIntentDeterministic(PYTHON_DETAILED)!;
    const draft = createDraftFromParsedIntent(parsed, PYTHON_DETAILED);

    expect(draft.skillLevelSuggestion?.value).toBe("beginner");
    expect(draft.skillLevelSuggestion?.source).toBe("explicit");
    expect(draft.durationWeeks).toEqual({ value: 8, source: "explicit" });
    expect(draft.studyHoursPerWeek).toEqual({ value: 6, source: "explicit" });
    expect(isDraftStepValid(draft, 1)).toBe(false);
  });

  it("requires manual skill selection even when a suggestion exists", () => {
    const parsed = parseGoalIntentDeterministic(PYTHON_DETAILED)!;
    const draft = createDraftFromParsedIntent(parsed, PYTHON_DETAILED);

    expect(isDraftStepValid(draft, 1)).toBe(false);

    draft.skillLevel = { value: "beginner", source: "manual" };
    draft.skillLevelConfirmed = true;

    expect(isDraftStepValid(draft, 1)).toBe(true);
  });

  it("only allows roadmap input conversion after skill confirmation", () => {
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic(PYTHON_SIMPLE)!,
      PYTHON_SIMPLE,
    );

    expect(() => draftToOnboardingInput(draft)).toThrow();

    draft.skillLevel = { value: "beginner", source: "manual" };
    draft.skillLevelConfirmed = true;

    const input = draftToOnboardingInput(draft);
    expect(input.goalTitle.toLowerCase()).toContain("python");
    expect(input.skillLevel).toBe("beginner");
  });

  it("uses goal-aware Python challenge options without AWS topic ids", () => {
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic(PYTHON_SIMPLE)!,
      PYTHON_SIMPLE,
    );
    const focusAreas = inferFocusAreas(draft.goalTitle, draft.goalCategory);
    const topicIds = mapFocusAreasToTopicIds(focusAreas, draft.goalSlug);

    expect(focusAreas.some((area) => /python/i.test(area))).toBe(true);
    expect(topicIds.join(" ")).not.toMatch(/vpc-networking|ec2-compute|s3-storage/);
  });

  it("shows certification label only for certification goals", () => {
    const azure = parseGoalIntentDeterministic("Prepare for Azure AZ-900")!;
    expect(goalTypeDisplayLabel(azure.goalType)).toBe("Certification");

    const python = parseGoalIntentDeterministic(PYTHON_SIMPLE)!;
    expect(goalTypeDisplayLabel(python.goalType)).toBe("Learning goal");
  });

  it("retains manual edits when navigating backward through draft updates", () => {
    const draft = createManualOnboardingDraft();
    draft.skillLevel = { value: "advanced", source: "manual" };
    draft.skillLevelConfirmed = true;
    draft.durationWeeks = { value: 10, source: "manual" };

    expect(draft.durationWeeks.value).toBe(10);
    expect(formatFieldSourceLabel(draft.durationWeeks.source)).toBe("Your selection");
  });
});

describe("presenter mode onboarding", () => {
  it("uses the same five-step confirmation flow without auto-skipping steps", () => {
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic(PYTHON_SIMPLE)!,
      PYTHON_SIMPLE,
    );

    expect(draft.skillLevelConfirmed).toBe(false);
    expect(isDraftStepValid(draft, 1)).toBe(false);
    expect(isDraftStepValid(draft, 4)).toBe(false);
  });
});

describe("roadmap generation gate", () => {
  it("does not call savePendingOnboarding before summary confirmation", async () => {
    const savePending = vi.fn();
    const draft = createDraftFromParsedIntent(
      parseGoalIntentDeterministic(PYTHON_SIMPLE)!,
      PYTHON_SIMPLE,
    );

    expect(isDraftStepValid(draft, 4)).toBe(false);
    expect(savePending).not.toHaveBeenCalled();
  });
});

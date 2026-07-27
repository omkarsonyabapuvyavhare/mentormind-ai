import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";
import { resolveGoalIdentityFromText } from "@/lib/goals/goal-identity";
import {
  mapFocusAreasToTopicIds,
} from "@/lib/onboarding/map-parsed-intent";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { universalOnboardingDefaults } from "@/lib/onboarding/schema";
import type { ParsedGoalIntent } from "@/lib/onboarding/parse-intent-schema";
import type { ParseIntentResponse } from "@/lib/onboarding/parse-intent-schema";
import {
  parseExplicitDurationWeeks,
  parseExplicitSkillLevel,
  parseExplicitStudyHoursPerWeek,
  parseExplicitStudyTimeOfDay,
} from "@/lib/onboarding/extract-explicit-hints";
import type { GoalType } from "@/lib/goals/goal-identity";
import type { LearningFormat, SkillLevel, StudyTimeOfDay } from "@/types/learning-twin";

export type FieldSource = "explicit" | "ai-suggested" | "default" | "manual";

export interface FieldWithSource<T> {
  value: T;
  source: FieldSource;
}

export type OnboardingPhase =
  | "idle"
  | "parsingIntent"
  | "intentParsed"
  | "collectingSkillLevel"
  | "collectingAvailability"
  | "collectingPreferences"
  | "reviewingSummary"
  | "generatingRoadmap"
  | "completed";

export interface OnboardingDraft {
  goalSlug: string;
  goalTitle: string;
  goalCategory: OnboardingInput["goalCategory"];
  goalType: GoalType;
  goalId: string;
  targetOutcome: string;
  recommendedFocusAreas: string[];
  skillLevel: FieldWithSource<SkillLevel> | null;
  skillLevelSuggestion: FieldWithSource<SkillLevel> | null;
  skillLevelConfirmed: boolean;
  durationWeeks: FieldWithSource<number>;
  studyHoursPerWeek: FieldWithSource<number>;
  studyTimeOfDay: FieldWithSource<StudyTimeOfDay>;
  focusDurationMinutes: FieldWithSource<number>;
  preferredFormats: FieldWithSource<LearningFormat[]>;
  knownChallengeTopicIds: FieldWithSource<string[]>;
}

export const UI_ONBOARDING_DEFAULTS = {
  durationWeeks: 8,
  studyHoursPerWeek: 6,
  studyTimeOfDay: "evening" as StudyTimeOfDay,
  focusDurationMinutes: 45,
  preferredFormats: ["video", "quiz"] as LearningFormat[],
  knownChallengeTopicIds: [] as string[],
};

function field<T>(value: T, source: FieldSource): FieldWithSource<T> {
  return { value, source };
}

export function createManualOnboardingDraft(): OnboardingDraft {
  return {
    goalSlug: universalOnboardingDefaults.goalSlug,
    goalTitle: universalOnboardingDefaults.goalTitle,
    goalCategory: universalOnboardingDefaults.goalCategory,
    goalType: universalOnboardingDefaults.goalType,
    goalId: universalOnboardingDefaults.goalId,
    targetOutcome: "Reach a structured learning outcome for this goal",
    recommendedFocusAreas: [],
    skillLevel: null,
    skillLevelSuggestion: null,
    skillLevelConfirmed: false,
    durationWeeks: field(UI_ONBOARDING_DEFAULTS.durationWeeks, "default"),
    studyHoursPerWeek: field(UI_ONBOARDING_DEFAULTS.studyHoursPerWeek, "default"),
    studyTimeOfDay: field(UI_ONBOARDING_DEFAULTS.studyTimeOfDay, "default"),
    focusDurationMinutes: field(UI_ONBOARDING_DEFAULTS.focusDurationMinutes, "default"),
    preferredFormats: field([...UI_ONBOARDING_DEFAULTS.preferredFormats], "default"),
    knownChallengeTopicIds: field([], "default"),
  };
}

export function createDraftFromParseResponse(
  response: ParseIntentResponse,
  sourceText: string,
): OnboardingDraft {
  return createDraftFromParsedIntent(response.parsed, sourceText);
}

export function createDraftFromParsedIntent(
  parsed: ParsedGoalIntent,
  sourceText: string,
): OnboardingDraft {
  const identity = resolveGoalIdentityFromText(parsed.goal, parsed.targetOutcome);
  const explicitSkill = parseExplicitSkillLevel(sourceText);
  const explicitDuration = parseExplicitDurationWeeks(sourceText);
  const explicitHours = parseExplicitStudyHoursPerWeek(sourceText);
  const explicitStudyTime = parseExplicitStudyTimeOfDay(sourceText);
  const focusAreas =
    parsed.recommendedFocusAreas.length > 0 ? parsed.recommendedFocusAreas : [];

  return {
    goalSlug: identity.goalSlug,
    goalTitle: identity.goalTitle,
    goalCategory: parsed.goalCategory ?? identity.goalCategory,
    goalType: parsed.goalType ?? identity.goalType,
    goalId: identity.goalSlug,
    targetOutcome: parsed.targetOutcome,
    recommendedFocusAreas: focusAreas,
    skillLevel: null,
    skillLevelSuggestion: explicitSkill ? field(explicitSkill, "explicit") : null,
    skillLevelConfirmed: false,
    durationWeeks: explicitDuration
      ? field(explicitDuration, "explicit")
      : field(UI_ONBOARDING_DEFAULTS.durationWeeks, "default"),
    studyHoursPerWeek: explicitHours
      ? field(explicitHours, "explicit")
      : field(UI_ONBOARDING_DEFAULTS.studyHoursPerWeek, "default"),
    studyTimeOfDay: explicitStudyTime
      ? field(explicitStudyTime, "explicit")
      : field(UI_ONBOARDING_DEFAULTS.studyTimeOfDay, "default"),
    focusDurationMinutes: field(UI_ONBOARDING_DEFAULTS.focusDurationMinutes, "default"),
    preferredFormats: field([...UI_ONBOARDING_DEFAULTS.preferredFormats], "default"),
    knownChallengeTopicIds: field([], "default"),
  };
}

export function draftToOnboardingInput(draft: OnboardingDraft): OnboardingInput {
  if (!draft.skillLevel) {
    throw new Error("Skill level must be confirmed before generating a roadmap.");
  }

  return {
    goalSlug: draft.goalSlug,
    goalTitle: draft.goalTitle,
    goalCategory: draft.goalCategory,
    goalType: draft.goalType,
    goalId: draft.goalId,
    skillLevel: draft.skillLevel.value,
    durationWeeks: draft.durationWeeks.value,
    studyHoursPerWeek: draft.studyHoursPerWeek.value,
    studyTimeOfDay: draft.studyTimeOfDay.value,
    focusDurationMinutes: draft.focusDurationMinutes.value,
    preferredFormats: [...draft.preferredFormats.value],
    knownChallengeTopicIds: [...draft.knownChallengeTopicIds.value],
  };
}

export function draftToRoadmapContext(draft: OnboardingDraft): RoadmapGenerationContext {
  return {
    goal: draft.goalTitle,
    domain: draft.goalCategory,
    targetOutcome: draft.targetOutcome,
    recommendedFocusAreas:
      draft.recommendedFocusAreas.length > 0
        ? draft.recommendedFocusAreas
        : undefined,
  };
}

export function onboardingInputToDraft(input: OnboardingInput): OnboardingDraft {
  return {
    goalSlug: input.goalSlug,
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    goalType: input.goalType,
    goalId: input.goalId,
    targetOutcome: "Reach a structured learning outcome for this goal",
    recommendedFocusAreas: mapFocusAreasToTopicIds(input.knownChallengeTopicIds).length
      ? input.knownChallengeTopicIds
      : [],
    skillLevel: field(input.skillLevel, "manual"),
    skillLevelSuggestion: null,
    skillLevelConfirmed: true,
    durationWeeks: field(input.durationWeeks, "manual"),
    studyHoursPerWeek: field(input.studyHoursPerWeek, "manual"),
    studyTimeOfDay: field(input.studyTimeOfDay, "manual"),
    focusDurationMinutes: field(input.focusDurationMinutes, "manual"),
    preferredFormats: field([...input.preferredFormats], "manual"),
    knownChallengeTopicIds: field([...input.knownChallengeTopicIds], "manual"),
  };
}

export function phaseForStep(step: number): OnboardingPhase {
  switch (step) {
    case 0:
      return "idle";
    case 1:
      return "collectingSkillLevel";
    case 2:
      return "collectingAvailability";
    case 3:
      return "collectingPreferences";
    case 4:
      return "reviewingSummary";
    default:
      return "idle";
  }
}

export function isDraftStepValid(draft: OnboardingDraft, step: number): boolean {
  switch (step) {
    case 1:
      return draft.skillLevelConfirmed && draft.skillLevel !== null;
    case 2:
      return (
        draft.durationWeeks.value >= 4 &&
        draft.durationWeeks.value <= 16 &&
        draft.studyHoursPerWeek.value >= 1 &&
        draft.studyHoursPerWeek.value <= 40
      );
    case 3:
      return draft.preferredFormats.value.length > 0;
    case 4:
      return isDraftStepValid(draft, 1) && isDraftStepValid(draft, 2) && isDraftStepValid(draft, 3);
    default:
      return true;
  }
}

export function formatFieldSourceLabel(source: FieldSource): string {
  switch (source) {
    case "explicit":
      return "Detected from your goal";
    case "ai-suggested":
      return "Suggested — please confirm";
    case "default":
      return "Default — adjust as needed";
    case "manual":
      return "Your selection";
  }
}

export function goalTypeDisplayLabel(goalType: GoalType): string {
  switch (goalType) {
    case "Certification":
      return "Certification";
    case "Skill":
      return "Learning goal";
  }
}

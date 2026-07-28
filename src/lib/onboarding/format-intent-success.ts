import { categoryLabel } from "@/lib/onboarding/map-parsed-intent";

import {

  goalTypeDisplayLabel,

  type OnboardingDraft,

} from "@/lib/onboarding/onboarding-draft";

import type { ParsedGoalIntent } from "@/lib/onboarding/parse-intent-schema";



export interface IntentSuccessSummary {

  goalTypeLabel: string;

  goalTitle: string;

  category: string;

  goalType: string;

  targetOutcome: string;

}


export function formatIntentSuccessSummary(parsed: ParsedGoalIntent): IntentSuccessSummary {

  return {

    goalTypeLabel: goalTypeDisplayLabel(parsed.goalType),

    goalTitle: parsed.goal,

    category: categoryLabel(parsed.goalCategory),

    goalType: parsed.goalType === "Certification" ? "Certification" : "Skill",

    targetOutcome: parsed.targetOutcome,

  };

}



export function formatDraftGoalSummary(draft: OnboardingDraft): IntentSuccessSummary {

  return {

    goalTypeLabel: goalTypeDisplayLabel(draft.goalType),

    goalTitle: draft.goalTitle,

    category: categoryLabel(draft.goalCategory),

    goalType: draft.goalType === "Certification" ? "Certification" : "Skill",

    targetOutcome: draft.targetOutcome,

  };

}



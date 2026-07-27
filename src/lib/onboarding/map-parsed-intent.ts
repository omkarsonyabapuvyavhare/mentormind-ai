import { slugifyTitle } from "@/lib/ai/slug-id";
import {
  inferFocusAreas,
  isAwsCertificationGoal,
  resolveGoalIdentityFromText,
  type GoalCategory,
} from "@/lib/goals/goal-identity";
import { universalOnboardingDefaults } from "@/lib/onboarding/schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { ParsedGoalIntent } from "@/lib/onboarding/parse-intent-schema";

const LEGACY_AWS_TOPIC_MAP: Array<{ pattern: RegExp; topicId: string }> = [
  { pattern: /\bvpc\b|virtual private cloud|networking/i, topicId: "vpc-networking" },
  { pattern: /\bec2\b|compute/i, topicId: "ec2-compute" },
  { pattern: /\bs3\b|storage/i, topicId: "s3-storage" },
  { pattern: /\biam\b|identity|security/i, topicId: "iam-security" },
];

export function resolveGoalIdFromParsedIntent(parsed: ParsedGoalIntent): string {
  return resolveGoalIdentityFromText(parsed.goal, parsed.targetOutcome).goalSlug;
}

export function mapFocusAreasToTopicIds(
  focusAreas: string[],
  goalSlug?: string,
): string[] {
  const useAwsTopicMap = goalSlug ? isAwsCertificationGoal(goalSlug) : false;
  const topicIds = new Set<string>();

  for (const area of focusAreas) {
    if (useAwsTopicMap) {
      const legacyMatch = LEGACY_AWS_TOPIC_MAP.find(({ pattern }) => pattern.test(area));
      if (legacyMatch) {
        topicIds.add(legacyMatch.topicId);
        continue;
      }
    }

    topicIds.add(slugifyTitle(area));
  }

  if (topicIds.size === 0 && focusAreas[0]) {
    topicIds.add(slugifyTitle(focusAreas[0]));
  }

  return [...topicIds];
}

/**
 * @deprecated Use `createDraftFromParsedIntent()` + learner confirmation + `draftToOnboardingInput()`.
 * Retained for legacy tests only — not used in live onboarding flow.
 */
export function mapParsedIntentToOnboardingInput(parsed: ParsedGoalIntent): OnboardingInput {
  const identity = resolveGoalIdentityFromText(parsed.goal, parsed.targetOutcome);
  const focusAreas =
    parsed.recommendedFocusAreas.length > 0
      ? parsed.recommendedFocusAreas
      : inferFocusAreas(identity.goalTitle, identity.goalCategory);

  return {
    goalSlug: identity.goalSlug,
    goalTitle: identity.goalTitle,
    goalCategory: parsed.goalCategory ?? identity.goalCategory,
    goalType: parsed.goalType ?? identity.goalType,
    goalId: identity.goalSlug,
    skillLevel: parsed.currentSkillLevel,
    durationWeeks: parsed.durationWeeks,
    studyHoursPerWeek: parsed.studyHoursPerWeek,
    studyTimeOfDay: universalOnboardingDefaults.studyTimeOfDay,
    focusDurationMinutes: universalOnboardingDefaults.focusDurationMinutes,
    preferredFormats: [...universalOnboardingDefaults.preferredFormats],
    knownChallengeTopicIds: mapFocusAreasToTopicIds(focusAreas, identity.goalSlug),
  };
}

export function categoryLabel(category: GoalCategory): string {
  return category;
}

export function isLegacyAwsOnboardingGoal(input: OnboardingInput): boolean {
  return isAwsCertificationGoal(input.goalSlug);
}

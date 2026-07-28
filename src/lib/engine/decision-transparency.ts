import type { ReasonCode } from "@/types/decisions";
import type { GoalType } from "@/lib/goals/goal-identity";

export interface DecisionTransparency {
  trigger: string;
  whatChanged: string;
  why: string;
  expectedBenefit: string;
}

const defaultReasonBenefits: Partial<Record<ReasonCode, string>> = {
  QUIZ_BELOW_THRESHOLD: "Build mastery before progressing to advanced architecture topics.",
  QUIZ_MASTERY_ACHIEVED: "Move forward faster with confidence in foundational networking skills.",
  INACTIVITY_ESCALATION: "Rebuild confidence with a shorter, focused recovery session before moving forward.",
  REVISION_NO_LONGER_NEEDED: "Spend time on new content instead of unnecessary repetition.",
  MILESTONE_DELAYED_FOR_REMEDIATION: "Create space to strengthen prerequisites before the next milestone.",
  ROADMAP_ACCELERATED: "Reach your learning goal sooner after demonstrated mastery.",
};

const certificationReasonBenefits: Partial<Record<ReasonCode, string>> = {
  ROADMAP_ACCELERATED: "Reach your certification goal sooner after demonstrated mastery.",
};

export function buildDecisionTransparency(
  eventLabel: string,
  whatChanged: string,
  why: string,
  reasons: ReasonCode[],
  goalType: GoalType = "Skill",
): DecisionTransparency {
  const primaryReason = reasons[0];
  const reasonBenefits =
    goalType === "Certification"
      ? { ...defaultReasonBenefits, ...certificationReasonBenefits }
      : defaultReasonBenefits;

  return {
    trigger: eventLabel,
    whatChanged,
    why,
    expectedBenefit:
      (primaryReason && reasonBenefits[primaryReason]) ||
      (goalType === "Certification"
        ? "Improve long-term retention and exam readiness."
        : "Improve long-term retention and practical readiness."),
  };
}

export function summarizeQuizFailureChanges(
  revisionCount: number,
  labCount: number,
  milestoneDelayDays: number,
): string {
  return `${revisionCount} revision tasks, ${labCount} lab, milestone +${milestoneDelayDays} days`;
}

export function summarizeMasteryChanges(advancedUnlocked: boolean, daysSaved: number): string {
  return `Pending remedial work removed, ${advancedUnlocked ? "advanced content unlocked, " : ""}roadmap accelerated by ${daysSaved} days`;
}

export function summarizeInactivityChanges(
  shortenedMinutes: number | undefined,
  riskIncrease: number,
): string {
  return `Dropout risk +${riskIncrease}, next session shortened${shortenedMinutes ? ` to ${shortenedMinutes} minutes` : ""}, contextual nudge sent`;
}

import type { AdaptationRevealKind } from "@/types/ui-state";
import type { AppState } from "@/stores/store-types";
import {
  selectAdaptationMessage,
  selectDecisionTransparency,
  selectLatestDecision,
  selectWeakTopics,
} from "@/stores/selectors";
import {
  resolveActiveAssessmentTopicId,
  resolveActiveAssessmentTopicName,
  resolveTopicDisplayName,
} from "@/lib/learner/resolve-topic-display-name";
import { selectLearnerGoalLabel, withGoalReference } from "@/lib/ai/reasoning-summary";

export interface MentorFeedback {
  headline: string;
  reassurance: string;
  explanation: string;
  nextStepHint: string;
  kind: AdaptationRevealKind;
  score: number;
}

export function selectMentorFeedback(
  state: AppState,
  score: number,
  kind: AdaptationRevealKind,
): MentorFeedback {
  const transparency = selectDecisionTransparency(state);
  const latestDecision = selectLatestDecision(state);
  const weaknesses = selectWeakTopics(state);
  const weakTopic = weaknesses.find(
    (entry) => entry.topicId === resolveActiveAssessmentTopicId(state),
  );
  const learnerGoal = selectLearnerGoalLabel(state);
  const goalType = state.twin?.goal.type ?? "Skill";
  const activeTopicName = resolveActiveAssessmentTopicName(state);

  if (kind === "mastery") {
    return {
      kind,
      score,
      headline: "Excellent work — you demonstrated mastery.",
      reassurance: withGoalReference(
        goalType === "Certification"
          ? "This is exactly the progress that accelerates your certification timeline"
          : "This is exactly the progress that accelerates your learning timeline",
        learnerGoal,
      ),
      explanation:
        latestDecision?.explanation ??
        transparency?.whatChanged ??
        withGoalReference("I removed remedial work and unlocked your next advanced topic", learnerGoal),
      nextStepHint: withGoalReference("Your learning plan is updated — let's see what's unlocked next", learnerGoal),
    };
  }

  if (kind === "weakness") {
    return {
      kind,
      score,
      headline: "Don't worry — this is how learning works.",
      reassurance: withGoalReference(
        "A lower score shows me where to focus so gaps don't carry into harder topics",
        learnerGoal,
      ),
      explanation:
        weakTopic
          ? `${activeTopicName} gap at ${weakTopic.score}%. ${selectAdaptationMessage(state)} ${withGoalReference("Remediation protects your timeline", learnerGoal)}`
          : withGoalReference(selectAdaptationMessage(state), learnerGoal),
      nextStepHint: withGoalReference("I added targeted practice — let's review what changed", learnerGoal),
    };
  }

  return {
    kind,
    score,
    headline: "Solid effort — let's refine a few areas.",
    reassurance: withGoalReference("You're closer than you think — a quick review locks in the concepts", learnerGoal),
    explanation:
      latestDecision?.explanation ??
      transparency?.why ??
      withGoalReference(`Score ${score}% — next session adjusted to reinforce key ideas`, learnerGoal),
    nextStepHint: withGoalReference("Your plan reflects this session — see what's next", learnerGoal),
  };
}

export function selectPlanUpdateSummary(state: AppState, kind: AdaptationRevealKind): {
  title: string;
  body: string;
  highlights: string[];
} {
  const transparency = selectDecisionTransparency(state);
  const learnerGoal = selectLearnerGoalLabel(state);
  const goalType = state.twin?.goal.type ?? "Skill";
  const goalCategory = state.twin?.goal.category ?? "General Technology";
  const activeTopicId = resolveActiveAssessmentTopicId(state);
  const activeTopicName = activeTopicId
    ? resolveTopicDisplayName(state, activeTopicId)
    : resolveActiveAssessmentTopicName(state);
  const goalFocus = extractGoalFocusLabel(learnerGoal, goalCategory);

  if (kind === "mastery") {
    const body =
      goalType === "Certification"
        ? "Strengthens retention and prepares you for upcoming exam milestones."
        : "Strengthens retention and prepares you for the next learning milestone.";
    const advancedHighlight =
      goalType === "Certification"
        ? "Advanced content unlocked toward your exam"
        : goalFocus
          ? `Advanced ${goalFocus} content unlocked`
          : "Advanced content unlocked toward your learning goal";

    return {
      title: "Your plan just accelerated",
      body: withGoalReference(transparency?.expectedBenefit ?? body, learnerGoal),
      highlights: [
        "Remedial tasks removed from your roadmap",
        withGoalReference(advancedHighlight, learnerGoal),
        `${activeTopicName} moved to your strengths`,
      ],
    };
  }

  if (kind === "weakness") {
    const timelineCopy =
      goalType === "Certification"
        ? "Timeline adjusted to protect your certification goal"
        : "Timeline adjusted to protect your learning goal";

    return {
      title: "Your plan now includes targeted support",
      body: withGoalReference(
        transparency?.expectedBenefit ?? `Extra practice for ${activeTopicName} before you advance`,
        learnerGoal,
      ),
      highlights: [
        `Revision tasks added for ${activeTopicName}`,
        "Learning Twin updated with your quiz signal",
        withGoalReference(timelineCopy, learnerGoal),
      ],
    };
  }

  return {
    title: "Your plan was fine-tuned",
    body: withGoalReference(transparency?.expectedBenefit ?? "Small adjustments keep you on track", learnerGoal),
    highlights: [
      withGoalReference("Next session prioritized for your goal", learnerGoal),
      "Roadmap version updated",
    ],
  };
}

function extractGoalFocusLabel(goalLabel: string, goalCategory: string): string | null {
  const normalized = goalLabel
    .replace(/^i\s+(want|would like)\s+to\s+/i, "")
    .replace(/^learn\s+/i, "")
    .replace(/\bin\s+\d+\s+(day|days|week|weeks|month|months)\b.*$/i, "")
    .trim();

  if (normalized) {
    const first = normalized.split(/\s+/)[0];
    if (first) {
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }

  if (goalCategory && goalCategory !== "Unknown" && goalCategory !== "General Technology") {
    const categoryFocus = goalCategory.split("/")[0]?.trim();
    return categoryFocus || null;
  }

  return null;
}

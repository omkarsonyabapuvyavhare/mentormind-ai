import { getTopicName } from "@/lib/engine/helpers";
import type { AdaptationRevealKind } from "@/types/ui-state";
import type { AppState } from "@/stores/store-types";
import {
  selectAdaptationMessage,
  selectDecisionTransparency,
  selectLatestDecision,
  selectWeakTopics,
} from "@/stores/selectors";
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
  const weakTopic = weaknesses[0];
  const learnerGoal = selectLearnerGoalLabel(state);

  if (kind === "mastery") {
    return {
      kind,
      score,
      headline: "Excellent work — you demonstrated mastery.",
      reassurance: withGoalReference(
        "This is exactly the progress that accelerates your certification timeline",
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
          ? `${weakTopic.topicName} gap at ${weakTopic.score}%. ${selectAdaptationMessage(state)} ${withGoalReference("Remediation protects your timeline", learnerGoal)}`
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
  const weaknesses = selectWeakTopics(state);
  const learnerGoal = selectLearnerGoalLabel(state);

  if (kind === "mastery") {
    return {
      title: "Your plan just accelerated",
      body: withGoalReference(
        transparency?.expectedBenefit ?? "Remedial work removed — advanced content unlocked",
        learnerGoal,
      ),
      highlights: [
        "Remedial tasks removed from your roadmap",
        withGoalReference("Advanced content unlocked toward your exam", learnerGoal),
        `${getTopicName("vpc-networking")} moved to your strengths`,
      ],
    };
  }

  if (kind === "weakness") {
    const topic = weaknesses[0]?.topicName ?? "this topic";
    return {
      title: "Your plan now includes targeted support",
      body: withGoalReference(
        transparency?.expectedBenefit ?? `Extra practice for ${topic} before you advance`,
        learnerGoal,
      ),
      highlights: [
        `Revision tasks added for ${topic}`,
        "Learning Twin updated with your quiz signal",
        withGoalReference("Timeline adjusted to protect your certification goal", learnerGoal),
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

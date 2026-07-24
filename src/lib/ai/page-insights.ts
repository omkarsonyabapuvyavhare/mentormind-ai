import { demoInitialRecommendation } from "@/constants/demo";
import { PAGE_QUESTIONS } from "@/constants/mentor-voice";
import { getTopicName } from "@/lib/engine/helpers";
import { selectNextBestAction } from "@/lib/ai/mentor-responses";
import type { AppState } from "@/stores/store-types";
import {
  selectCurrentMilestone,
  selectDecisionTransparency,
  selectLatestDecision,
  selectLatestNudge,
  selectMentorRecommendation,
  selectNextTask,
  selectStrongestTopic,
  selectWeakTopics,
} from "@/stores/selectors";

export interface MentorInsight {
  question: string;
  what: string;
  why: string;
  expectedBenefit: string;
}

function baselineDashboardInsight(state: AppState): MentorInsight {
  const nextTask = selectNextTask(state);
  const milestone = selectCurrentMilestone(state);

  return {
    question: PAGE_QUESTIONS.dashboard,
    what: nextTask ? `Complete ${nextTask.title}` : "Review your next unlocked task",
    why: "VPC Networking is a prerequisite for upcoming cloud architecture milestones.",
    expectedBenefit: milestone
      ? `Stay on track for ${milestone.title.replace(/^Week \d+ — /, "")} and keep your certification timeline achievable.`
      : "Maintain momentum toward your AWS certification goal.",
  };
}

export function selectDashboardPageInsight(state: AppState): MentorInsight {
  const latestDecision = selectLatestDecision(state);
  const transparency = selectDecisionTransparency(state);
  const nextTask = selectNextTask(state);

  if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED") && transparency) {
    return {
      question: PAGE_QUESTIONS.dashboard,
      what: "Celebrate mastery — then advance to unlocked architecture content",
      why: transparency.why,
      expectedBenefit: transparency.expectedBenefit,
    };
  }

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD") && transparency) {
    const revisionTask = state.roadmap?.tasks.find(
      (task) =>
        task.type === "revision" &&
        task.status === "pending" &&
        task.injectedBy !== undefined,
    );

    return {
      question: PAGE_QUESTIONS.dashboard,
      what: revisionTask
        ? `Start ${revisionTask.title}`
        : selectNextBestAction(state),
      why: transparency.why,
      expectedBenefit: transparency.expectedBenefit,
    };
  }

  if (latestDecision?.reasons.includes("INACTIVITY_ESCALATION")) {
    const nudge = selectLatestNudge(state);
    return {
      question: PAGE_QUESTIONS.dashboard,
      what: nextTask
        ? `Return with a focused ${nextTask.estimatedMinutes}-minute session: ${nextTask.title}`
        : selectNextBestAction(state),
      why: latestDecision.explanation,
      expectedBenefit:
        nudge?.body ??
        "Rebuild consistency before dropout risk rises and your certification timeline slips.",
    };
  }

  if (selectMentorRecommendation(state) !== demoInitialRecommendation) {
    return {
      question: PAGE_QUESTIONS.dashboard,
      what: nextTask ? `Complete ${nextTask.title}` : selectNextBestAction(state),
      why: selectMentorRecommendation(state),
      expectedBenefit: "Close the gap between where you are and your next milestone.",
    };
  }

  return baselineDashboardInsight(state);
}

export function selectRoadmapPageInsight(state: AppState): MentorInsight {
  const transparency = selectDecisionTransparency(state);
  const latestDecision = selectLatestDecision(state);

  if (transparency && latestDecision) {
    return {
      question: PAGE_QUESTIONS.roadmap,
      what: transparency.whatChanged,
      why: transparency.why,
      expectedBenefit: transparency.expectedBenefit,
    };
  }

  return {
    question: PAGE_QUESTIONS.roadmap,
    what: "Your plan follows your AWS certification goal across eight structured weeks",
    why: "MentorMind built this roadmap from your goal, availability, and Learning Twin profile. It updates when new learner signals arrive.",
    expectedBenefit:
      "Every task has a purpose in the chain — prerequisites first, then advanced architecture topics.",
  };
}

export function selectAssessmentPageInsight(
  state: AppState,
  topicId = "vpc-networking",
  topicTitle = "VPC Networking",
): MentorInsight {
  const weakness = selectWeakTopics(state).find((topic) => topic.topicId === topicId);
  const strength = state.twin?.strengths.find((topic) => topic.topicId === topicId);

  if (strength) {
    return {
      question: PAGE_QUESTIONS.assessment,
      what: `Retake the ${topicTitle} assessment to confirm mastery`,
      why: `You recently demonstrated mastery at ${strength.score}%. MentorMind uses retakes to keep your profile accurate.`,
      expectedBenefit: "Sustained high scores keep remedial work removed and advanced content unlocked.",
    };
  }

  if (weakness) {
    return {
      question: PAGE_QUESTIONS.assessment,
      what: `Retake the ${topicTitle} assessment after remediation`,
      why: `A prior score of ${weakness.score}% flagged this topic. MentorMind needs a new signal to adjust your roadmap.`,
      expectedBenefit: "Strong recovery removes remedial tasks and can accelerate your certification timeline.",
    };
  }

  return {
    question: PAGE_QUESTIONS.assessment,
    what: `Take the ${topicTitle} assessment`,
    why: "This helps MentorMind understand your strengths and weaknesses so it can personalize your roadmap.",
    expectedBenefit:
      "Your score becomes a learner signal that can trigger targeted remediation or unlock the next milestone.",
  };
}

export function selectLearningTwinPageInsight(state: AppState): MentorInsight {
  const twin = state.twin;
  if (!twin) {
    return {
      question: PAGE_QUESTIONS.learningTwin,
      what: "Your learner profile is not initialized yet",
      why: "MentorMind needs a Learning Twin before it can reason about your goals and habits.",
      expectedBenefit: "Create a plan or run the demo to activate personalized mentor decisions.",
    };
  }

  const strengths = twin.strengths.map((topic) => topic.topicName).join(", ") || "building baseline";
  const weaknesses =
    twin.weaknesses.map((topic) => topic.topicName).join(", ") || "none confirmed yet";
  const strongest = selectStrongestTopic(state)?.topicName;

  return {
    question: PAGE_QUESTIONS.learningTwin,
    what: `I remember your ${twin.goal.examCode ?? "certification"} goal, ${twin.currentStreakDays}-day streak, and performance in ${strengths}`,
    why: `I also track weaknesses (${weaknesses}), ${twin.preferences.studyTimeOfDay} study preference, and every quiz you complete.`,
    expectedBenefit:
      strongest
        ? `Your strongest area is ${strongest} — I use this memory so every future recommendation fits how you actually learn.`
        : "Every future recommendation and roadmap change will reflect this evolving memory.",
  };
}

export function selectMentorPageInsight(state: AppState): MentorInsight {
  const transparency = selectDecisionTransparency(state);
  const latestDecision = selectLatestDecision(state);
  const nudge = selectLatestNudge(state);

  if (nudge && !nudge.read && latestDecision?.reasons.includes("INACTIVITY_ESCALATION")) {
    return {
      question: PAGE_QUESTIONS.mentor,
      what: selectNextBestAction(state),
      why: `${nudge.title}. ${nudge.body}`,
      expectedBenefit:
        transparency?.expectedBenefit ??
        "A shorter, focused session makes it easier to return without losing momentum.",
    };
  }

  if (transparency && latestDecision) {
    return {
      question: PAGE_QUESTIONS.mentor,
      what: selectNextBestAction(state),
      why: transparency.why,
      expectedBenefit: transparency.expectedBenefit,
    };
  }

  const nextTask = selectNextTask(state);
  return {
    question: PAGE_QUESTIONS.mentor,
    what: selectNextBestAction(state),
    why: selectMentorRecommendation(state),
    expectedBenefit: nextTask
      ? `Estimated effort: ${nextTask.estimatedMinutes} minutes toward your certification goal.`
      : "Stay aligned with your AWS certification roadmap.",
  };
}

export function selectAssessmentTopicInsight(state: AppState, topicId: string): MentorInsight {
  const topicName = getTopicName(topicId);
  return selectAssessmentPageInsight(state, topicId, topicName);
}

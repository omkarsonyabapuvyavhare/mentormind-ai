import { getAssessmentTopic } from "@/constants/assessment";
import { routes } from "@/constants/routes";
import { getLessonContent } from "@/data/lesson-content";
import { selectLearnerGoalLabel, withGoalReference } from "@/lib/ai/reasoning-summary";
import { getTopicName } from "@/lib/engine/helpers";
import type { AppState } from "@/stores/store-types";
import {
  selectLatestDecision,
  selectNextTask,
  selectWeakTopics,
} from "@/stores/selectors";

export interface TodayMission {
  topicId: string;
  goal: string;
  learnerGoal: string;
  why: string;
  estimatedMinutes: number;
  expectedOutcome: string;
  lessonHref: string;
  assessmentHref: string | null;
}

export function selectMissionTopicId(state: AppState): string {
  const nextTask = selectNextTask(state);
  const quizCount = state.twin?.quizHistory.length ?? 0;
  const challenges = state.twin?.knownChallenges.map((challenge) => challenge.topicId) ?? [];

  if (quizCount === 0 && challenges.includes("vpc-networking")) {
    return "vpc-networking";
  }

  if (nextTask?.topicId) {
    return nextTask.topicId;
  }

  return "vpc-networking";
}

export function selectTodayMission(state: AppState): TodayMission {
  const topicId = selectMissionTopicId(state);
  const lesson = getLessonContent(topicId);
  const nextTask = selectNextTask(state);
  const weaknesses = selectWeakTopics(state);
  const latestDecision = selectLatestDecision(state);
  const assessment = getAssessmentTopic(topicId);
  const learnerGoal = selectLearnerGoalLabel(state);

  let why: string;

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    why = `Your last check-in showed a gap in ${getTopicName(topicId)}. This focused session rebuilds the foundation before we move forward.`;
  } else if (weaknesses.some((topic) => topic.topicId === topicId)) {
    why = `I flagged ${getTopicName(topicId)} as a focus area from your learner profile — we'll strengthen it before your next milestone.`;
  } else if (state.twin?.knownChallenges.some((challenge) => challenge.topicId === topicId)) {
    why = `You told me ${getTopicName(topicId)} is challenging — I'm starting here so we build confidence early.`;
  } else if (nextTask) {
    why = `This is your next unlocked step on the certification path — ${nextTask.type === "revision" ? "targeted remediation" : "core curriculum"} before advancing.`;
  } else {
    why = "This topic unlocks the next phase of your certification path";
  }

  let expectedOutcome: string;

  if (assessment) {
    expectedOutcome = withGoalReference(
      `You'll understand ${lesson.title.toLowerCase()} and confirm retention in a short check-in`,
      learnerGoal,
    );
  } else {
    expectedOutcome = withGoalReference(
      `You'll grasp the core ideas in ${lesson.estimatedMinutes} minutes and advance your milestone`,
      learnerGoal,
    );
  }

  return {
    topicId,
    goal: lesson.title,
    learnerGoal,
    why: withGoalReference(why, learnerGoal),
    estimatedMinutes: nextTask?.estimatedMinutes ?? lesson.estimatedMinutes,
    expectedOutcome,
    lessonHref: routes.lesson(topicId),
    assessmentHref: assessment?.href ?? null,
  };
}

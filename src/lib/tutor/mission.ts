import { routes } from "@/constants/routes";
import { selectLearnerGoalLabel, withGoalReference } from "@/lib/ai/reasoning-summary";
import { getTopicName } from "@/lib/engine/helpers";
import type { AppState } from "@/stores/store-types";
import {
  selectLatestDecision,
  selectNextTask,
  selectWeakTopics,
} from "@/stores/selectors";
import type { LearningTask } from "@/types/roadmap";

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

export const EMPTY_MISSION_TITLE = "Your next lesson is being prepared";
export const EMPTY_MISSION_OUTCOME =
  "Review your roadmap or complete the current milestone to continue.";

export function resolveAssessmentHref(state: AppState, topicId: string): string | null {
  if (!state.isInitialized || !state.roadmap || !topicId) {
    return null;
  }

  return routes.assessmentTopic(topicId);
}

export function selectMissionTopicId(state: AppState): string | null {
  return selectNextTask(state)?.topicId ?? null;
}

function buildPathLabel(state: AppState): string {
  return state.twin?.goal.type === "Certification" ? "certification path" : "learning path";
}

function buildWhyForTask(
  state: AppState,
  nextTask: LearningTask,
  topicId: string,
  pathLabel: string,
): string {
  const weaknesses = selectWeakTopics(state);
  const latestDecision = selectLatestDecision(state);

  if (latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return `Your last check-in showed a gap in ${getTopicName(topicId)}. This focused session rebuilds the foundation before we move forward.`;
  }

  if (weaknesses.some((topic) => topic.topicId === topicId)) {
    return `I flagged ${getTopicName(topicId)} as a focus area from your learner profile — we'll strengthen it before your next milestone.`;
  }

  if (state.twin?.knownChallenges.some((challenge) => challenge.topicId === topicId)) {
    return `You told me ${getTopicName(topicId)} is challenging — I'm starting here so we build confidence early.`;
  }

  return `This is your next unlocked step on the ${pathLabel} — ${nextTask.type === "revision" ? "targeted remediation" : "core curriculum"} before advancing.`;
}

function buildExpectedOutcomeFromTask(nextTask: LearningTask, learnerGoal: string): string {
  const objectives = nextTask.learningObjectives?.filter(Boolean) ?? [];

  if (objectives.length >= 2) {
    const summary = objectives
      .slice(0, 2)
      .map((objective) => objective.replace(/\.$/, "").toLowerCase())
      .join(", ");

    return withGoalReference(`You'll ${summary} before moving forward`, learnerGoal);
  }

  if (objectives.length === 1) {
    const objective = objectives[0]!.replace(/\.$/, "").toLowerCase();
    return withGoalReference(`You'll ${objective} before moving forward`, learnerGoal);
  }

  return withGoalReference(
    `You'll build confidence in ${nextTask.title.toLowerCase()} and advance your learning plan`,
    learnerGoal,
  );
}

function buildEmptyTodayMission(state: AppState, learnerGoal: string): TodayMission {
  return {
    topicId: "",
    goal: EMPTY_MISSION_TITLE,
    learnerGoal,
    why: withGoalReference(
      "Review your roadmap or complete your current milestone to unlock the next step",
      learnerGoal,
    ),
    estimatedMinutes: 0,
    expectedOutcome: withGoalReference(EMPTY_MISSION_OUTCOME, learnerGoal),
    lessonHref: routes.roadmap,
    assessmentHref: null,
  };
}

function buildRoadmapTodayMission(
  state: AppState,
  nextTask: LearningTask,
  learnerGoal: string,
): TodayMission {
  const topicId = nextTask.topicId;
  const pathLabel = buildPathLabel(state);
  const assessmentHref = resolveAssessmentHref(state, topicId);

  return {
    topicId,
    goal: nextTask.title,
    learnerGoal,
    why: withGoalReference(buildWhyForTask(state, nextTask, topicId, pathLabel), learnerGoal),
    estimatedMinutes: nextTask.estimatedMinutes,
    expectedOutcome: buildExpectedOutcomeFromTask(nextTask, learnerGoal),
    lessonHref: routes.lesson(topicId),
    assessmentHref,
  };
}

export function selectTodayMission(state: AppState): TodayMission {
  const learnerGoal = selectLearnerGoalLabel(state);
  const nextTask = selectNextTask(state);

  if (!nextTask) {
    return buildEmptyTodayMission(state, learnerGoal);
  }

  return buildRoadmapTodayMission(state, nextTask, learnerGoal);
}

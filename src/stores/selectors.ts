import { theme } from "@/constants/theme";
import {
  demoInitialNextTaskId,
  demoInitialRecommendation,
  demoNoDecisionMessage,
  demoNoWeaknessMessage,
  demoStepCount,
} from "@/constants/demo";
import { resolveTopicDisplayName } from "@/lib/learner/resolve-topic-display-name";
import {
  buildDecisionTransparency,
  summarizeInactivityChanges,
  summarizeMasteryChanges,
  summarizeQuizFailureChanges,
  type DecisionTransparency,
} from "@/lib/engine/decision-transparency";
import type { AppState } from "@/stores/store-types";
import type { Decision, DecisionAction } from "@/types/decisions";
import type { QuizCompletedEvent } from "@/types/events";
import type { LearningTask, Milestone, TaskType } from "@/types/roadmap";
import { thresholds } from "@/constants/thresholds";

export type DropoutRiskLevel = "low" | "medium" | "high";

export interface RoadmapCompletion {
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}

const COUNTABLE_TASK_TYPES = new Set<TaskType>([
  "lesson",
  "quiz",
  "lab",
  "revision",
  "review",
]);

/** Tasks that count toward overall roadmap completion. */
export function selectCountableRoadmapTasks(tasks: LearningTask[]): LearningTask[] {
  return tasks.filter(
    (task) => COUNTABLE_TASK_TYPES.has(task.type) && task.status !== "skipped",
  );
}

export function computeRoadmapCompletion(tasks: LearningTask[]): RoadmapCompletion {
  const countable = selectCountableRoadmapTasks(tasks);
  const totalTasks = countable.length;
  const completedTasks = Math.min(
    countable.filter((task) => task.status === "completed").length,
    totalTasks,
  );
  const percentage =
    totalTasks === 0
      ? 0
      : Math.min(100, Math.max(0, Math.round((completedTasks / totalTasks) * 100)));

  return { completedTasks, totalTasks, percentage };
}

export function selectRoadmapCompletion(state: Pick<AppState, "roadmap">): RoadmapCompletion {
  if (!state.roadmap || state.roadmap.tasks.length === 0) {
    return { completedTasks: 0, totalTasks: 0, percentage: 0 };
  }

  return computeRoadmapCompletion(state.roadmap.tasks);
}

export function selectMilestoneCompletion(tasks: LearningTask[]): RoadmapCompletion {
  return computeRoadmapCompletion(tasks);
}

export function selectCurrentStreak(state: Pick<AppState, "twin">): number {
  return state.twin?.currentStreakDays ?? 0;
}

export function selectCurrentMilestone(
  state: Pick<AppState, "roadmap">,
): Milestone | null {
  if (!state.roadmap) {
    return null;
  }

  const current = state.roadmap.milestones.find((milestone) => milestone.status === "current");
  if (current) {
    return current;
  }

  return (
    [...state.roadmap.milestones]
      .sort((a, b) => a.order - b.order)
      .find((milestone) => milestone.status !== "completed") ?? null
  );
}

export function selectUpcomingTasks(state: Pick<AppState, "roadmap">): LearningTask[] {
  if (!state.roadmap) {
    return [];
  }

  const milestoneOrder = new Map(
    state.roadmap.milestones.map((milestone) => [milestone.id, milestone.order]),
  );

  return state.roadmap.tasks
    .filter((task) => task.status === "pending" && task.unlocked)
    .sort((a, b) => {
      const orderDiff =
        (milestoneOrder.get(a.milestoneId) ?? 0) - (milestoneOrder.get(b.milestoneId) ?? 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return a.priority - b.priority;
    });
}

export function selectNextTask(state: Pick<AppState, "roadmap">): LearningTask | null {
  const upcoming = selectUpcomingTasks(state);
  return upcoming[0] ?? null;
}

export function selectWeakTopics(state: Pick<AppState, "twin">) {
  return state.twin?.weaknesses ?? [];
}

export function selectStrongestTopic(state: Pick<AppState, "twin">) {
  if (!state.twin || state.twin.strengths.length === 0) {
    return null;
  }

  return [...state.twin.strengths].sort((a, b) => b.score - a.score)[0];
}

export function selectWeakestTopic(state: Pick<AppState, "twin">) {
  const weaknesses = selectWeakTopics(state);
  if (weaknesses.length > 0) {
    return [...weaknesses].sort((a, b) => a.score - b.score)[0];
  }

  return null;
}

export function selectLatestQuiz(state: Pick<AppState, "twin">) {
  if (!state.twin || state.twin.quizHistory.length === 0) {
    return null;
  }

  return state.twin.quizHistory[state.twin.quizHistory.length - 1];
}

export function selectDropoutRisk(state: Pick<AppState, "twin">): number {
  return state.twin?.dropoutRisk ?? 0;
}

export function selectDropoutRiskLevel(state: Pick<AppState, "twin">): DropoutRiskLevel {
  const risk = selectDropoutRisk(state);

  if (risk <= theme.riskLevels.low) {
    return "low";
  }

  if (risk <= theme.riskLevels.medium) {
    return "medium";
  }

  return "high";
}

export function selectLatestDecision(state: Pick<AppState, "decisions">) {
  if (state.decisions.length === 0) {
    return null;
  }

  return state.decisions[state.decisions.length - 1];
}

export function selectUnreadNudges(state: Pick<AppState, "nudges">) {
  return state.nudges.filter((nudge) => !nudge.read);
}

export function selectTimeSpentVsPlanned(state: Pick<AppState, "twin">): {
  spentMinutes: number;
  plannedMinutes: number;
} {
  return {
    spentMinutes: state.twin?.totalStudyMinutes ?? 0,
    plannedMinutes: state.twin?.plannedStudyMinutes ?? 0,
  };
}

export function selectMilestoneProgress(state: Pick<AppState, "roadmap">): number {
  const milestone = selectCurrentMilestone(state);
  if (!milestone || !state.roadmap) {
    return 0;
  }

  const milestoneTasks = state.roadmap.tasks.filter(
    (task) => task.milestoneId === milestone.id,
  );

  if (milestoneTasks.length === 0) {
    return 0;
  }

  const completed = milestoneTasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / milestoneTasks.length) * 100);
}

export function selectMentorRecommendation(
  state: Pick<AppState, "twin" | "roadmap" | "decisions">,
): string {
  const latestDecision = selectLatestDecision(state);
  const weaknesses = selectWeakTopics(state);

  if (weaknesses.length > 0 && latestDecision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    const revisionTask = state.roadmap?.tasks.find(
      (task) =>
        task.type === "revision" &&
        task.status === "pending" &&
        task.injectedBy !== undefined,
    );

    if (revisionTask) {
      return `${latestDecision.explanation} Next best action: Start ${revisionTask.title}.`;
    }

    return latestDecision.explanation;
  }

  if (latestDecision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return latestDecision.explanation;
  }

  if (latestDecision?.reasons.includes("INACTIVITY_ESCALATION")) {
    return latestDecision.explanation;
  }

  const nextTask = selectNextTask(state);
  if (nextTask?.id === demoInitialNextTaskId) {
    if (state.twin?.goal.type === "Certification") {
      return demoInitialRecommendation;
    }
    return `Prioritize ${nextTask.title} today to keep momentum on your learning goal.`;
  }

  if (nextTask) {
    const goalPhrase =
      state.twin?.goal.type === "Certification" ? "certification goal" : "learning goal";
    return `Prioritize ${nextTask.title} today to stay on track for your ${goalPhrase}.`;
  }

  if (state.twin?.goal.type === "Certification") {
    return "Review your next unlocked task to stay on track for your certification goal.";
  }

  return "Review your next unlocked task to stay on track for your learning goal.";
}

export function selectAdaptationMessage(state: Pick<AppState, "decisions">): string {
  const latest = selectLatestDecision(state);
  return latest?.explanation ?? demoNoDecisionMessage;
}

export function selectWeakTopicsMessage(state: Pick<AppState, "twin">): string {
  if (selectWeakTopics(state).length === 0) {
    return demoNoWeaknessMessage;
  }

  return "";
}

export function selectInjectedRemedialTaskCount(state: Pick<AppState, "roadmap">): number {
  return state.roadmap?.tasks.filter((task) => task.injectedBy !== undefined).length ?? 0;
}

export function selectInjectedTasks(state: Pick<AppState, "roadmap">): LearningTask[] {
  return state.roadmap?.tasks.filter((task) => task.injectedBy !== undefined) ?? [];
}

export function selectQuizAttemptsForTopic(
  state: Pick<AppState, "twin">,
  topicId: string,
) {
  return state.twin?.quizHistory.filter((attempt) => attempt.topicId === topicId) ?? [];
}

export function selectTopicWeakness(
  state: Pick<AppState, "twin">,
  topicId: string,
) {
  return state.twin?.weaknesses.find((weakness) => weakness.topicId === topicId) ?? null;
}

export function selectTopicStrength(
  state: Pick<AppState, "twin">,
  topicId: string,
) {
  return state.twin?.strengths.find((strength) => strength.topicId === topicId) ?? null;
}

export function selectLastQuizEvent(state: Pick<AppState, "learnerEvents">): QuizCompletedEvent | null {
  for (let index = state.learnerEvents.length - 1; index >= 0; index -= 1) {
    const event = state.learnerEvents[index];
    if (event.type === "QUIZ_COMPLETED") {
      return event;
    }
  }

  return null;
}

export interface DecisionActionSummary {
  revisionCount: number;
  labCount: number;
  milestoneDelayDays: number;
  daysSaved: number;
  advancedUnlocked: boolean;
  shortenedMinutes?: number;
  dropoutRisk?: number;
}

export function summarizeDecisionActions(decision: Decision): DecisionActionSummary {
  const summary: DecisionActionSummary = {
    revisionCount: 0,
    labCount: 0,
    milestoneDelayDays: 0,
    daysSaved: 0,
    advancedUnlocked: false,
  };

  for (const action of decision.actions) {
    applyActionToSummary(action, summary);
  }

  return summary;
}

function applyActionToSummary(action: DecisionAction, summary: DecisionActionSummary) {
  switch (action.action) {
    case "ADD_TASKS":
      summary.revisionCount += action.tasks.filter((task) => task.type === "revision").length;
      summary.labCount += action.tasks.filter((task) => task.type === "lab").length;
      break;
    case "SHIFT_MILESTONE":
      summary.milestoneDelayDays = action.daysDelta;
      break;
    case "COMPRESS_ROADMAP":
      summary.daysSaved = action.daysSaved;
      break;
    case "UNLOCK_CONTENT":
      summary.advancedUnlocked = action.topicIds.includes(thresholds.advancedUnlockTopicId);
      break;
    case "SHORTEN_NEXT_TASK":
      summary.shortenedMinutes = action.newMinutes;
      break;
    case "UPDATE_DROPOUT_RISK":
      summary.dropoutRisk = action.dropoutRisk;
      break;
    default:
      break;
  }
}

export function selectDecisionTransparency(
  state: Pick<AppState, "decisions" | "learnerEvents" | "twin" | "roadmap">,
  decision = selectLatestDecision(state),
): DecisionTransparency | null {
  if (!decision) {
    return null;
  }

  const summary = summarizeDecisionActions(decision);
  const lastQuiz = selectLastQuizEvent(state);
  const trigger = buildTriggerLabel(state, decision, lastQuiz, state.twin?.inactivityDays);
  const whatChanged = buildWhatChangedLabel(decision, summary);
  const why = decision.explanation.split(".")[0] ?? decision.explanation;

  return buildDecisionTransparency(
    trigger,
    whatChanged,
    why,
    decision.reasons,
    state.twin?.goal.type ?? "Skill",
  );
}

function buildTriggerLabel(
  state: Pick<AppState, "twin" | "roadmap">,
  decision: Decision,
  lastQuiz: QuizCompletedEvent | null,
  inactivityDays?: number,
): string {
  if (decision.eventType === "QUIZ_COMPLETED" && lastQuiz) {
    const topicName = resolveTopicDisplayName(state, lastQuiz.topicId);
    return `${topicName} quiz score: ${lastQuiz.score}%`;
  }

  if (decision.eventType === "INACTIVITY_TICK") {
    const days = inactivityDays ?? thresholds.inactivityTriggerDays;
    return `Inactive for ${days} days`;
  }

  return decision.eventType.replaceAll("_", " ").toLowerCase();
}

function buildWhatChangedLabel(decision: Decision, summary: DecisionActionSummary): string {
  if (decision.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return summarizeQuizFailureChanges(
      summary.revisionCount,
      summary.labCount,
      summary.milestoneDelayDays,
    );
  }

  if (decision.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return summarizeMasteryChanges(summary.advancedUnlocked, summary.daysSaved);
  }

  if (decision.reasons.includes("INACTIVITY_ESCALATION")) {
    return summarizeInactivityChanges(
      summary.shortenedMinutes,
      thresholds.dropoutRiskIncreaseOnInactivity,
    );
  }

  if (decision.actions.length === 0) {
    return "No roadmap changes";
  }

  return `${decision.actions.length} adaptation actions applied`;
}

export function selectDelayedMilestones(state: Pick<AppState, "roadmap">): Milestone[] {
  return state.roadmap?.milestones.filter((milestone) => milestone.status === "delayed") ?? [];
}

export function selectTasksByMilestone(state: Pick<AppState, "roadmap">): Map<string, LearningTask[]> {
  const grouped = new Map<string, LearningTask[]>();

  if (!state.roadmap) {
    return grouped;
  }

  for (const task of state.roadmap.tasks) {
    const existing = grouped.get(task.milestoneId) ?? [];
    existing.push(task);
    grouped.set(task.milestoneId, existing);
  }

  for (const [milestoneId, tasks] of grouped.entries()) {
    grouped.set(
      milestoneId,
      [...tasks].sort((a, b) => a.priority - b.priority),
    );
  }

  return grouped;
}

export function selectLatestNudge(state: Pick<AppState, "nudges">) {
  if (state.nudges.length === 0) {
    return null;
  }

  return state.nudges[state.nudges.length - 1];
}

export function selectRoadmapAccelerationDays(state: Pick<AppState, "decisions">): number | null {
  const latest = selectLatestDecision(state);
  if (!latest?.reasons.includes("ROADMAP_ACCELERATED")) {
    return null;
  }

  return summarizeDecisionActions(latest).daysSaved || thresholds.roadmapAccelerationDays;
}

export function selectHasRecentAdaptation(state: Pick<AppState, "decisions">): boolean {
  return state.decisions.length > 0;
}

export function selectDemoProgress(state: Pick<AppState, "demoStepIndex">): {
  completedSteps: number;
  totalSteps: number;
  percent: number;
} {
  const totalSteps = demoStepCount;
  const completedSteps = Math.min(state.demoStepIndex, totalSteps);

  return {
    completedSteps,
    totalSteps,
    percent: totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
  };
}

export function selectDashboardMetrics(state: AppState) {
  return {
    completion: selectRoadmapCompletion(state),
    streak: selectCurrentStreak(state),
    nextTask: selectNextTask(state),
    dropoutRisk: selectDropoutRisk(state),
    dropoutRiskLevel: selectDropoutRiskLevel(state),
    timeSpentVsPlanned: selectTimeSpentVsPlanned(state),
    consistencyScore: state.twin?.consistencyScore ?? 0,
    learningVelocity: state.twin?.learningVelocity ?? 0,
    currentMilestone: selectCurrentMilestone(state),
    milestoneProgress: selectMilestoneProgress(state),
    upcomingTasks: selectUpcomingTasks(state).slice(0, 3),
    weakTopics: selectWeakTopics(state),
    strongestTopic: selectStrongestTopic(state),
    weakestTopic: selectWeakestTopic(state),
    latestQuiz: selectLatestQuiz(state),
    latestDecision: selectLatestDecision(state),
    unreadNudges: selectUnreadNudges(state),
    mentorRecommendation: selectMentorRecommendation(state),
    adaptationMessage: selectAdaptationMessage(state),
    weakTopicsMessage: selectWeakTopicsMessage(state),
    roadmapVersion: state.roadmap?.version ?? 0,
    demoProgress: selectDemoProgress(state),
  };
}

export function selectLatestDecisionInjectedTasks(state: AppState): import("@/types/roadmap").LearningTask[] {
  const decision = selectLatestDecision(state);
  if (!decision || !state.roadmap) {
    return [];
  }

  return state.roadmap.tasks.filter((task) => task.injectedBy === decision.id);
}

export function selectMilestoneIdsWithRecentChanges(state: AppState): Set<string> {
  const ids = new Set<string>();
  const decision = selectLatestDecision(state);

  if (!state.roadmap || !decision) {
    return ids;
  }

  for (const task of state.roadmap.tasks) {
    if (task.injectedBy === decision.id) {
      ids.add(task.milestoneId);
    }
  }

  for (const milestone of state.roadmap.milestones) {
    if (milestone.status === "delayed") {
      ids.add(milestone.id);
    }
  }

  return ids;
}

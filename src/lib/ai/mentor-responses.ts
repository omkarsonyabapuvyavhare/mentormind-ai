import { demoInitialRecommendation } from "@/constants/demo";
import { getTopicName } from "@/lib/engine/helpers";
import type { AppState } from "@/stores/store-types";
import {
  selectCurrentStreak,
  selectDecisionTransparency,
  selectDropoutRisk,
  selectDropoutRiskLevel,
  selectLatestDecision,
  selectLatestNudge,
  selectMentorRecommendation,
  selectNextTask,
  selectRoadmapCompletion,
  selectWeakTopics,
} from "@/stores/selectors";

export type MentorQuestionId =
  | "why-roadmap-changed"
  | "what-study-next"
  | "how-progressing";

export interface MentorQuestion {
  id: MentorQuestionId;
  label: string;
}

export const mentorQuestions: MentorQuestion[] = [
  { id: "why-roadmap-changed", label: "Why did my roadmap change?" },
  { id: "what-study-next", label: "What should I study next?" },
  { id: "how-progressing", label: "How am I progressing?" },
];

export function selectNextBestAction(state: AppState): string {
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
      return `Start ${revisionTask.title}`;
    }
  }

  const nextTask = selectNextTask(state);
  if (nextTask) {
    return `Start ${nextTask.title}`;
  }

  return "Review your roadmap and choose the next unlocked task.";
}

export function answerMentorQuestion(questionId: MentorQuestionId, state: AppState): string {
  switch (questionId) {
    case "why-roadmap-changed":
      return answerWhyRoadmapChanged(state);
    case "what-study-next":
      return answerWhatStudyNext(state);
    case "how-progressing":
      return answerHowProgressing(state);
    default:
      return "No mentor guidance is available yet.";
  }
}

function answerWhyRoadmapChanged(state: AppState): string {
  const decision = selectLatestDecision(state);
  if (!decision) {
    return "Your roadmap has not changed yet. Complete an assessment or study session to activate adaptive planning.";
  }

  const transparency = selectDecisionTransparency(state, decision);
  if (!transparency) {
    return decision.explanation;
  }

  return [
    `Trigger: ${transparency.trigger}`,
    `What changed: ${transparency.whatChanged}`,
    `Why: ${transparency.why}`,
    `Expected benefit: ${transparency.expectedBenefit}`,
  ].join("\n");
}

function answerWhatStudyNext(state: AppState): string {
  const recommendation = selectMentorRecommendation(state);
  const nextAction = selectNextBestAction(state);
  const nudge = selectLatestNudge(state);

  if (nudge && !nudge.read) {
    return `${nudge.title}. ${nudge.body} Next best action: ${nextAction}.`;
  }

  if (recommendation !== demoInitialRecommendation) {
    return `${recommendation} Next best action: ${nextAction}.`;
  }

  return `${recommendation} Next best action: ${nextAction}.`;
}

function answerHowProgressing(state: AppState): string {
  const completion = selectRoadmapCompletion(state);
  const streak = selectCurrentStreak(state);
  const consistency = state.twin?.consistencyScore ?? 0;
  const risk = selectDropoutRisk(state);
  const riskLevel = selectDropoutRiskLevel(state);
  const velocity = state.twin?.learningVelocity ?? 0;
  const latestQuiz = state.twin?.quizHistory[state.twin.quizHistory.length - 1];

  const lines = [
    `Overall roadmap completion: ${completion}%.`,
    `Consistency score: ${consistency}.`,
    `Current streak: ${streak} day${streak === 1 ? "" : "s"}.`,
    `Dropout risk: ${risk} (${riskLevel}).`,
    `Learning velocity: ${velocity.toFixed(1)} topics per week.`,
  ];

  if (latestQuiz) {
    lines.push(
      `Latest quiz: ${getTopicName(latestQuiz.topicId)} at ${latestQuiz.score}%.`,
    );
  }

  if (state.twin && state.twin.inactivityDays > 0) {
    lines.push(`Inactivity: ${state.twin.inactivityDays} day(s) since last activity.`);
  }

  return lines.join(" ");
}

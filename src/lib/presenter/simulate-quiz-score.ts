import { buildAnswersForTargetScore } from "@/lib/assessment/quiz-scoring";
import {
  scoreAssessmentByConcept,
  type ConceptScoreResult,
} from "@/lib/assessment/concept-scoring";
import { buildQuizCompletedPayload } from "@/lib/assessment/normalize-quiz-result";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import type { LearnerEventPayload } from "@/types/events";

/** PPT-aligned presenter scores — matches the reference demo shortcuts. */
export const PRESENTER_WEAK_SCORE = demo.weakQuizScore;
export const PRESENTER_MASTERY_SCORE = demo.masteryQuizScore;

export function buildPresenterQuizResult(
  assessment: TopicAssessment,
  targetScore: number,
): ConceptScoreResult {
  const answers = buildAnswersForTargetScore(assessment.questions, targetScore);
  const result = scoreAssessmentByConcept(
    assessment.questions,
    answers,
    assessment.passingScore,
    thresholds.masteryScore,
  );

  return {
    ...result,
    score: targetScore,
    passed: targetScore >= assessment.passingScore,
    mastery: targetScore >= thresholds.masteryScore,
  };
}

export function buildPresenterQuizCompletedEvent(
  assessment: TopicAssessment,
  targetScore: number,
  timestamp: string,
): Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }> {
  const result = buildPresenterQuizResult(assessment, targetScore);
  return buildQuizCompletedPayload(assessment, result, timestamp);
}

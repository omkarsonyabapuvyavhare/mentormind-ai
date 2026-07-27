import type { ConceptScoreResult } from "@/lib/assessment/concept-scoring";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import type { LearnerEventPayload } from "@/types/events";

export function buildQuizCompletedPayload(
  assessment: TopicAssessment,
  result: ConceptScoreResult,
  timestamp: string,
): Extract<LearnerEventPayload, { type: "QUIZ_COMPLETED" }> {
  return {
    type: "QUIZ_COMPLETED",
    topicId: assessment.topicId,
    score: result.score,
    totalQuestions: result.totalQuestions,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
    masteredConceptTags: result.masteredConceptTags,
    weakConceptTags: result.weakConceptTags,
    timestamp,
  };
}

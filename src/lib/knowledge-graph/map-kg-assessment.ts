import { slugifyTitle } from "@/lib/ai/slug-id";
import type { KgAssessmentQuestion } from "@/knowledge-base/schema";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import {
  assessmentQuestionSchema,
  TARGET_ASSESSMENT_QUESTIONS,
  topicAssessmentSchema,
  type AssessmentQuestion,
  type TopicAssessment,
} from "@/lib/assessment/assessment-schema";

export function mapKgQuestionToAssessmentQuestion(
  question: KgAssessmentQuestion,
  topicId: string,
  index: number,
): AssessmentQuestion | null {
  const conceptTag = slugifyTitle(question.conceptId).slice(0, 64) || `concept-${index + 1}`;
  const candidate = {
    id: question.id || `assessment-${topicId}-${conceptTag}-${index + 1}`,
    topicId,
    conceptTag,
    prompt: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    conceptId: question.conceptId,
    difficulty: question.difficulty,
    questionType: question.questionType,
    sourceTopicId: question.sourceTopicId,
    prerequisiteIds: question.prerequisiteIds,
  };

  const parsed = assessmentQuestionSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function buildTopicAssessmentFromKgQuestions(
  topicId: string,
  questions: KgAssessmentQuestion[],
  knowledgeGraphId: string,
  canonicalTopicId: string,
  source: TopicAssessment["source"] = "fallback",
): TopicAssessment | null {
  const mapped = questions
    .map((question, index) => mapKgQuestionToAssessmentQuestion(question, topicId, index))
    .filter((question): question is AssessmentQuestion => Boolean(question))
    .slice(0, TARGET_ASSESSMENT_QUESTIONS);

  if (mapped.length !== TARGET_ASSESSMENT_QUESTIONS) {
    return null;
  }

  const parsed = topicAssessmentSchema.safeParse({
    topicId,
    passingScore: 70,
    questions: mapped,
    source,
    knowledgeGraphId,
    canonicalTopicId,
    kgValidationVersion: KG_VALIDATION_VERSION,
  });

  return parsed.success ? parsed.data : null;
}

import { slugifyTitle } from "@/lib/ai/slug-id";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import {
  filterValidLessonQuestions,
  selectDiverseAssessmentQuestions,
  validateAssessmentQuestionQuality,
} from "@/lib/assessment/assessment-question-quality";
import {
  assessmentQuestionSchema,
  TARGET_ASSESSMENT_QUESTIONS,
  topicAssessmentSchema,
  validateAssessmentForGoal,
  type AssessmentQuestion,
  type AssessmentValidationContext,
  type TopicAssessment,
} from "@/lib/assessment/assessment-schema";
import { buildDeterministicAssessmentQuestions } from "@/lib/assessment/assessment-fallback";

const PASSING_SCORE = 70;

function buildQuestionId(topicId: string, conceptTag: string, index: number): string {
  return `assessment-${topicId}-${conceptTag}-${index + 1}`;
}

function toConceptTag(
  sectionHeading: string,
  objective: string | undefined,
  explicitTag?: string,
): string {
  if (explicitTag) {
    return slugifyTitle(explicitTag).slice(0, 64);
  }

  if (objective) {
    return slugifyTitle(objective).slice(0, 64) || slugifyTitle(sectionHeading).slice(0, 64);
  }

  return slugifyTitle(sectionHeading).slice(0, 64) || "core-concepts";
}

function knowledgeCheckToQuestion(
  topicId: string,
  conceptTag: string,
  question: {
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    conceptTag?: string;
  },
  index: number,
): AssessmentQuestion | null {
  const resolvedTag = toConceptTag("", undefined, question.conceptTag ?? conceptTag);
  const candidate = {
    id: buildQuestionId(topicId, resolvedTag, index),
    topicId,
    conceptTag: resolvedTag,
    prompt: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  };

  const parsed = assessmentQuestionSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function extractLessonQuestions(lesson: GeneratedLessonPayload): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];

  lesson.sections.forEach((section, sectionIndex) => {
    const objective = lesson.learningObjectives[sectionIndex] ?? lesson.learningObjectives[0];
    const defaultConceptTag = toConceptTag(section.heading, objective);

    section.knowledgeCheck.forEach((check, checkIndex) => {
      const mapped = knowledgeCheckToQuestion(
        lesson.topicId,
        defaultConceptTag,
        check,
        sectionIndex * TARGET_ASSESSMENT_QUESTIONS + checkIndex,
      );

      if (mapped) {
        questions.push(mapped);
      }
    });
  });

  return questions;
}

function buildFallbackInput(lesson: GeneratedLessonPayload, context: AssessmentValidationContext) {
  return {
    topicId: lesson.topicId,
    topicTitle: lesson.title,
    goalSlug: context.goalSlug,
    goalCategory: context.goalCategory,
    learningObjectives: lesson.learningObjectives,
    sections: lesson.sections.map((section) => ({
      heading: section.heading,
      summary: section.summary,
      content: section.content,
      commonMistakes: section.commonMistakes,
      practicalExample: section.practicalExample,
    })),
    practicalArtifact: lesson.practicalArtifact,
    handsOnExercise: lesson.handsOnExercise,
  };
}

function buildFallbackAssessment(
  lesson: GeneratedLessonPayload,
  context: AssessmentValidationContext,
): TopicAssessment {
  return topicAssessmentSchema.parse({
    topicId: lesson.topicId,
    passingScore: PASSING_SCORE,
    questions: buildDeterministicAssessmentQuestions({
      ...buildFallbackInput(lesson, context),
      startIndex: 0,
      count: TARGET_ASSESSMENT_QUESTIONS,
    }),
    source: "fallback",
  });
}

function supplementQuestions(
  lesson: GeneratedLessonPayload,
  context: AssessmentValidationContext,
  existing: AssessmentQuestion[],
): AssessmentQuestion[] {
  const needed = TARGET_ASSESSMENT_QUESTIONS - existing.length;

  if (needed <= 0) {
    return existing;
  }

  const fallbackQuestions = buildDeterministicAssessmentQuestions({
    ...buildFallbackInput(lesson, context),
    startIndex: existing.length,
    count: needed,
    excludeConceptTags: existing.map((question) => question.conceptTag),
  });

  return [...existing, ...fallbackQuestions];
}

export function buildAssessmentFromLesson(
  lesson: GeneratedLessonPayload,
  context: AssessmentValidationContext,
): TopicAssessment {
  const extracted = filterValidLessonQuestions(extractLessonQuestions(lesson));

  // Blend lesson knowledge checks with artifact/exercise/core seeds so the five
  // questions cover distinct technical signals instead of five similar section checks.
  let technicalSeeds: AssessmentQuestion[] = [];
  try {
    technicalSeeds = buildDeterministicAssessmentQuestions({
      ...buildFallbackInput(lesson, context),
      startIndex: 0,
      count: TARGET_ASSESSMENT_QUESTIONS,
    });
  } catch {
    technicalSeeds = [];
  }

  const preferredPool = [
    ...technicalSeeds.filter((question) =>
      /practical-artifact|hands-on-exercise|common-misconception|key-takeaway|core-explanation/i.test(
        question.conceptTag,
      ),
    ),
    ...extracted,
    ...technicalSeeds,
  ];

  let questions = selectDiverseAssessmentQuestions(preferredPool, TARGET_ASSESSMENT_QUESTIONS);
  let source: TopicAssessment["source"] =
    extracted.length > 0 && technicalSeeds.length > 0
      ? "hybrid"
      : extracted.length > 0
        ? "lesson"
        : "fallback";

  if (questions.length < TARGET_ASSESSMENT_QUESTIONS) {
    try {
      questions = supplementQuestions(lesson, context, questions);
      source = extracted.length > 0 ? "hybrid" : "fallback";
    } catch {
      return buildFallbackAssessment(lesson, context);
    }
  }

  questions = questions.slice(0, TARGET_ASSESSMENT_QUESTIONS);

  let assessment = topicAssessmentSchema.parse({
    topicId: lesson.topicId,
    passingScore: PASSING_SCORE,
    questions,
    source,
  });

  const structureError = validateAssessmentForGoal(assessment, context);
  const qualityError = validateAssessmentQuestionQuality(assessment.questions);

  if (!structureError && !qualityError) {
    return assessment;
  }

  // Regenerate once from deterministic technical fallback.
  assessment = buildFallbackAssessment(lesson, context);

  const fallbackStructureError = validateAssessmentForGoal(assessment, context);
  const fallbackQualityError = validateAssessmentQuestionQuality(assessment.questions);

  if (fallbackStructureError || fallbackQualityError) {
    throw new Error(
      fallbackQualityError ??
        fallbackStructureError ??
        "Unable to build a valid distinct technical assessment.",
    );
  }

  return assessment;
}

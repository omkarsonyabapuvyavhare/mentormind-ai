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
import { buildKgAssessment } from "@/knowledge-base/generation";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import { validateAssessmentAgainstKg } from "@/knowledge-base/validation";
import {
  buildTopicAssessmentFromKgQuestions,
  logKgPipelineDev,
  mapKgQuestionToAssessmentQuestion,
} from "@/lib/knowledge-graph";

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

function tryBuildKgAssessment(
  lesson: GeneratedLessonPayload,
  context: AssessmentValidationContext,
  goalTitle: string,
): TopicAssessment | null {
  const kgBuilt = buildKgAssessment({
    topicId: lesson.canonicalTopicId ?? lesson.topicId,
    knowledgeGraphId: lesson.knowledgeGraphId,
    goalTitle,
    goalCategory: context.goalCategory,
    aliases: [context.goalSlug, lesson.knowledgeGraphId ?? ""].filter(Boolean),
  });

  if (!kgBuilt.ok) {
    return null;
  }

  const validation = validateAssessmentAgainstKg({
    goalTitle,
    goalCategory: context.goalCategory,
    topicTitle: lesson.title,
    questions: kgBuilt.questions,
    aliases: [context.goalSlug, kgBuilt.knowledgeGraphId],
  });

  logKgPipelineDev({
    flow: "assessment",
    finalSource: validation.ok ? "kg" : null,
    knowledgeGraphId: validation.knowledgeGraphId,
    canonicalTopicId: validation.canonicalTopicId,
    uniqueConceptCount: validation.uniqueConceptIds.length,
    questionTypes: validation.questionTypes,
    diversityOk: validation.ok,
    reasons: validation.reasons,
    goalId: context.goalSlug,
    topicId: lesson.topicId,
  });

  if (!validation.ok) {
    return null;
  }

  return buildTopicAssessmentFromKgQuestions(
    lesson.topicId,
    kgBuilt.questions,
    kgBuilt.knowledgeGraphId,
    kgBuilt.canonicalTopicId,
    "fallback",
  );
}

function attachKgMetaIfPresent(
  assessment: TopicAssessment,
  lesson: GeneratedLessonPayload,
): TopicAssessment {
  if (!lesson.knowledgeGraphId && !lesson.canonicalTopicId) {
    return assessment;
  }

  return topicAssessmentSchema.parse({
    ...assessment,
    knowledgeGraphId: lesson.knowledgeGraphId ?? assessment.knowledgeGraphId,
    canonicalTopicId: lesson.canonicalTopicId ?? assessment.canonicalTopicId,
    kgValidationVersion: KG_VALIDATION_VERSION,
  });
}

export function buildAssessmentFromLesson(
  lesson: GeneratedLessonPayload,
  context: AssessmentValidationContext & { goalTitle?: string },
): TopicAssessment {
  const goalTitle = context.goalTitle ?? context.goalSlug;
  const resolved = resolveKnowledgeGraph(goalTitle, context.goalCategory, [
    context.goalSlug,
    lesson.knowledgeGraphId ?? "",
  ]);
  const kgResolved = resolved.status === "resolved" && Boolean(resolved.graph);

  // Preferred: validated lesson KCs when they already carry KG concept ids.
  if (kgResolved) {
    const lessonKgQuestions = extractLessonQuestions(lesson)
      .map((question, index) => {
        if (!question.conceptId) {
          // Promote conceptTag → conceptId when it matches a KG concept id shape.
          return {
            id: question.id,
            question: question.prompt,
            options: question.options,
            correctIndex: question.correctIndex as 0 | 1 | 2 | 3,
            explanation: question.explanation,
            conceptId: question.conceptTag,
            difficulty: question.difficulty ?? ("beginner" as const),
            questionType: question.questionType ?? ("concept-understanding" as const),
            sourceTopicId: lesson.canonicalTopicId ?? lesson.topicId,
            prerequisiteIds: question.prerequisiteIds ?? [],
          };
        }
        return {
          id: question.id,
          question: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex as 0 | 1 | 2 | 3,
          explanation: question.explanation,
          conceptId: question.conceptId,
          difficulty: question.difficulty ?? ("beginner" as const),
          questionType: question.questionType ?? ("concept-understanding" as const),
          sourceTopicId: question.sourceTopicId ?? lesson.canonicalTopicId ?? lesson.topicId,
          prerequisiteIds: question.prerequisiteIds ?? [],
        };
      });

    if (lessonKgQuestions.length === TARGET_ASSESSMENT_QUESTIONS) {
      const validation = validateAssessmentAgainstKg({
        goalTitle,
        goalCategory: context.goalCategory,
        topicTitle: lesson.title,
        questions: lessonKgQuestions,
        graph: resolved.graph,
        aliases: [context.goalSlug],
      });

      if (validation.ok) {
        const mapped = lessonKgQuestions
          .map((question, index) =>
            mapKgQuestionToAssessmentQuestion(question, lesson.topicId, index),
          )
          .filter((question): question is AssessmentQuestion => Boolean(question));

        if (mapped.length === TARGET_ASSESSMENT_QUESTIONS) {
          const fromLesson = topicAssessmentSchema.parse({
            topicId: lesson.topicId,
            passingScore: PASSING_SCORE,
            questions: mapped,
            source: "lesson",
            knowledgeGraphId: validation.knowledgeGraphId ?? undefined,
            canonicalTopicId: validation.canonicalTopicId ?? undefined,
            kgValidationVersion: KG_VALIDATION_VERSION,
          });

          logKgPipelineDev({
            flow: "assessment",
            finalSource: "lesson+kg",
            knowledgeGraphId: validation.knowledgeGraphId,
            canonicalTopicId: validation.canonicalTopicId,
            uniqueConceptCount: validation.uniqueConceptIds.length,
            questionTypes: validation.questionTypes,
            diversityOk: true,
            goalId: context.goalSlug,
            topicId: lesson.topicId,
          });

          return fromLesson;
        }
      }
    }

    const kgAssessment = tryBuildKgAssessment(lesson, context, goalTitle);
    if (kgAssessment) {
      return kgAssessment;
    }
  }

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
      if (kgResolved) {
        const kgAssessment = tryBuildKgAssessment(lesson, context, goalTitle);
        if (kgAssessment) {
          return kgAssessment;
        }
      }
      return attachKgMetaIfPresent(buildFallbackAssessment(lesson, context), lesson);
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
    return attachKgMetaIfPresent(assessment, lesson);
  }

  if (kgResolved) {
    const kgAssessment = tryBuildKgAssessment(lesson, context, goalTitle);
    if (kgAssessment) {
      return kgAssessment;
    }
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

  return attachKgMetaIfPresent(assessment, lesson);
}

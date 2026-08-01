import {
  hasGenericDistractors,
  isGenericMetaAssessmentQuestion,
  isGenericStudyAdviceQuestion,
  normalizeQuestionStem,
  stemsAreNearDuplicates,
} from "@/lib/assessment/assessment-question-quality";
import { matchTopic } from "@/knowledge-base/registry/match-topic";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import {
  kgAssessmentQuestionSchema,
  type KgAssessmentQuestion,
  type KnowledgeGraph,
} from "@/knowledge-base/schema";
import { detectDomainContamination } from "@/knowledge-base/validation/detect-domain-contamination";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export const KG_REQUIRED_ASSESSMENT_QUESTIONS = 5;
export const KG_MIN_UNIQUE_CONCEPTS = 4;
export const KG_MIN_QUESTION_TYPES = 3;

export interface AssessmentKgValidationResult {
  ok: boolean;
  reasons: string[];
  knowledgeGraphId: string | null;
  canonicalTopicId: string | null;
  uniqueConceptIds: string[];
  questionTypes: string[];
}

function parseQuestions(questions: unknown[]): {
  parsed: KgAssessmentQuestion[];
  reasons: string[];
} {
  const parsed: KgAssessmentQuestion[] = [];
  const reasons: string[] = [];

  for (const [index, question] of questions.entries()) {
    const result = kgAssessmentQuestionSchema.safeParse(question);
    if (!result.success) {
      reasons.push(`Question ${index + 1} failed KG assessment schema validation.`);
      continue;
    }
    parsed.push(result.data);
  }

  return { parsed, reasons };
}

/**
 * Diversity + KG concept validation for assessments.
 * Phase 1 validates only — deterministic KG assessment generation is Phase 2/3.
 */
export function validateAssessmentAgainstKg(input: {
  goalTitle: string;
  goalCategory: GoalCategory;
  topicTitle: string;
  questions: unknown[];
  graph?: KnowledgeGraph | null;
  aliases?: string[];
  /** Optional lesson fragment hashes/text to detect same-source clones. */
  sourceFragments?: string[];
}): AssessmentKgValidationResult {
  const reasons: string[] = [];
  const resolved =
    input.graph
      ? {
          status: "resolved" as const,
          graph: input.graph,
          confidence: 1,
          reason: "Graph provided by caller.",
        }
      : resolveKnowledgeGraph(input.goalTitle, input.goalCategory, input.aliases ?? []);

  if (resolved.status !== "resolved" || !resolved.graph) {
    return {
      ok: false,
      reasons: [resolved.reason],
      knowledgeGraphId: null,
      canonicalTopicId: null,
      uniqueConceptIds: [],
      questionTypes: [],
    };
  }

  const graph = resolved.graph;
  const topicMatch = matchTopic(graph, input.topicTitle);
  if (!topicMatch.topic) {
    return {
      ok: false,
      reasons: [`Unable to map assessment topic "${input.topicTitle}". ${topicMatch.reason}`],
      knowledgeGraphId: graph.id,
      canonicalTopicId: null,
      uniqueConceptIds: [],
      questionTypes: [],
    };
  }

  const topic = topicMatch.topic;
  const conceptIds = new Set(topic.concepts.map((concept) => concept.id));
  const { parsed, reasons: parseReasons } = parseQuestions(input.questions);
  reasons.push(...parseReasons);

  if (parsed.length !== KG_REQUIRED_ASSESSMENT_QUESTIONS) {
    reasons.push(
      `Assessment must contain exactly ${KG_REQUIRED_ASSESSMENT_QUESTIONS} questions (found ${parsed.length}).`,
    );
  }

  const uniqueConcepts = [...new Set(parsed.map((question) => question.conceptId))];
  if (uniqueConcepts.length < KG_MIN_UNIQUE_CONCEPTS) {
    reasons.push(
      `Assessment must cover at least ${KG_MIN_UNIQUE_CONCEPTS} unique concepts (found ${uniqueConcepts.length}).`,
    );
  }

  for (const question of parsed) {
    if (!conceptIds.has(question.conceptId)) {
      reasons.push(`Question ${question.id} references unrelated concept ${question.conceptId}.`);
    }
    if (question.sourceTopicId !== topic.id) {
      reasons.push(`Question ${question.id} sourceTopicId must be ${topic.id}.`);
    }
    if (isGenericStudyAdviceQuestion(question.question) || isGenericMetaAssessmentQuestion(question.question)) {
      reasons.push(`Question ${question.id} is generic study/meta content.`);
    }
    if (hasGenericDistractors(question.options)) {
      reasons.push(`Question ${question.id} uses generic distractor templates.`);
    }
  }

  for (let i = 0; i < parsed.length; i += 1) {
    for (let j = i + 1; j < parsed.length; j += 1) {
      const left = parsed[i]!;
      const right = parsed[j]!;
      if (normalizeQuestionStem(left.question) === normalizeQuestionStem(right.question)) {
        reasons.push(`Duplicate normalized stems between ${left.id} and ${right.id}.`);
      } else if (stemsAreNearDuplicates(left.question, right.question)) {
        reasons.push(`Near-duplicate stems between ${left.id} and ${right.id}.`);
      }
    }
  }

  const types = [...new Set(parsed.map((question) => question.questionType))];
  if (parsed.length === KG_REQUIRED_ASSESSMENT_QUESTIONS && types.length < KG_MIN_QUESTION_TYPES) {
    const supportedTypes = new Set(topic.assessmentSkills.map((skill) => skill.skill));
    if (supportedTypes.size >= KG_MIN_QUESTION_TYPES) {
      reasons.push(
        `Assessment must use at least ${KG_MIN_QUESTION_TYPES} question types when the topic supports them (found ${types.length}).`,
      );
    } else if (types.length < 2) {
      reasons.push("Assessment must not use a single question type for all items.");
    }
  }

  if (parsed.length === KG_REQUIRED_ASSESSMENT_QUESTIONS) {
    const indexes = parsed.map((question) => question.correctIndex);
    if (indexes.every((index) => index === indexes[0])) {
      reasons.push("All correct answers use the same index; diversify correctIndex when avoidable.");
    }
  }

  if (input.sourceFragments && input.sourceFragments.length > 0) {
    const normalizedFragments = input.sourceFragments.map((fragment) =>
      normalizeQuestionStem(fragment),
    );
    const sameSourceCount = parsed.filter((question) =>
      normalizedFragments.some(
        (fragment) =>
          fragment.length >= 24 &&
          normalizeQuestionStem(question.question).includes(fragment.slice(0, 40)),
      ),
    ).length;
    if (sameSourceCount >= KG_REQUIRED_ASSESSMENT_QUESTIONS) {
      reasons.push("All questions appear to originate from the same source fragment.");
    }
  }

  const contamination = detectDomainContamination({
    content: JSON.stringify(parsed),
    goalCategory: input.goalCategory,
    graph,
    topic,
  });
  for (const issue of contamination) {
    reasons.push(issue.reason);
  }

  return {
    ok: reasons.length === 0,
    reasons,
    knowledgeGraphId: graph.id,
    canonicalTopicId: topic.id,
    uniqueConceptIds: uniqueConcepts,
    questionTypes: types,
  };
}

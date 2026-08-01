import { matchTopic } from "@/knowledge-base/registry/match-topic";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import type { KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import { detectDomainContamination } from "@/knowledge-base/validation/detect-domain-contamination";
import {
  REQUIRED_LESSON_KNOWLEDGE_CHECKS,
  type AiLessonResponse,
} from "@/lib/ai/lesson-schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface LessonKgValidationResult {
  ok: boolean;
  reasons: string[];
  knowledgeGraphId: string | null;
  canonicalTopicId: string | null;
  coveredConceptIds: string[];
  knowledgeCheckCount: number;
}

const OBJECTIVE_ECHO_PATTERN =
  /which statement best reflects|explain key ideas in|your learning goal|overview statement about/i;

const GENERIC_STUDY_PATTERN =
  /best (way|first step) to study|what is the best next step|connect to your learning plan/i;

/**
 * Aggregation rule for "exactly five" knowledge checks:
 * Sum every section.knowledgeCheck entry across the lesson.
 * The lesson passes this rule only when the total equals REQUIRED_LESSON_KNOWLEDGE_CHECKS (5).
 * Per-section arrays may be 0–3 items; the lesson-level total is what KG validation enforces.
 */
export function countLessonKnowledgeChecks(lesson: AiLessonResponse): number {
  return lesson.sections.reduce(
    (total, section) => total + section.knowledgeCheck.length,
    0,
  );
}

function conceptCoverage(
  topic: KnowledgeTopic,
  lesson: AiLessonResponse,
): { covered: string[]; missing: string[] } {
  const haystack = [
    lesson.title,
    ...lesson.learningObjectives,
    lesson.practicalArtifact.title,
    lesson.practicalArtifact.content,
    lesson.practicalArtifact.explanation,
    ...lesson.handsOnExercise.instructions,
    ...lesson.sections.flatMap((section) => [
      section.heading,
      section.content,
      section.practicalExample,
      ...section.commonMistakes,
      ...section.summary,
      ...section.knowledgeCheck.map((check) => check.question),
    ]),
  ]
    .join("\n")
    .toLowerCase();

  const covered: string[] = [];
  const missing: string[] = [];

  for (const concept of topic.concepts) {
    const needles = [
      concept.id.replace(/^[a-z]+-/, "").replace(/-/g, " "),
      concept.title.toLowerCase(),
    ];
    const hit = needles.some((needle) => needle.length >= 3 && haystack.includes(needle));
    if (hit) {
      covered.push(concept.id);
    } else {
      missing.push(concept.id);
    }
  }

  return { covered, missing };
}

function practicalLinkedToTopic(
  topic: KnowledgeTopic,
  lesson: AiLessonResponse,
): boolean {
  const artifactText = [
    lesson.practicalArtifact.title,
    lesson.practicalArtifact.content,
    lesson.practicalArtifact.explanation,
  ]
    .join(" ")
    .toLowerCase();

  return topic.concepts.some((concept) => {
    const title = concept.title.toLowerCase();
    return title.length >= 3 && artifactText.includes(title);
  }) || topic.practicalArtifacts.some((seed) => {
    const seedTitle = seed.title.toLowerCase();
    return (
      artifactText.includes(seedTitle) ||
      lesson.practicalArtifact.type === seed.type
    );
  });
}

function authenticMistakes(topic: KnowledgeTopic, lesson: AiLessonResponse): boolean {
  const lessonMistakes = lesson.sections.flatMap((section) => section.commonMistakes);
  if (lessonMistakes.length < 3) {
    return false;
  }

  const topicMistakeText = topic.commonMistakes
    .map((mistake) => `${mistake.mistake} ${mistake.correction}`)
    .join(" ")
    .toLowerCase();

  // At least one lesson mistake should overlap topic vocabulary / seed mistakes.
  return lessonMistakes.some((mistake) => {
    const normalized = mistake.toLowerCase();
    if (topicMistakeText.includes(normalized.slice(0, Math.min(24, normalized.length)))) {
      return true;
    }
    return topic.concepts.some((concept) =>
      concept.commonMistakes.some((seed) =>
        normalized.includes(seed.toLowerCase().slice(0, 18)),
      ),
    ) || topic.concepts.some((concept) => normalized.includes(concept.title.toLowerCase()));
  });
}

/**
 * Validate an AI lesson against a KG topic.
 * Phase 1 validates only — deterministic KG lesson generation is Phase 2/3.
 */
export function validateLessonAgainstKg(input: {
  goalTitle: string;
  goalCategory: GoalCategory;
  topicTitle: string;
  lesson: AiLessonResponse;
  graph?: KnowledgeGraph | null;
  aliases?: string[];
}): LessonKgValidationResult {
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
      coveredConceptIds: [],
      knowledgeCheckCount: 0,
    };
  }

  const graph = resolved.graph;
  const topicMatch = matchTopic(graph, input.topicTitle);
  if (!topicMatch.topic) {
    return {
      ok: false,
      reasons: [`Unable to map lesson topic "${input.topicTitle}" to KG. ${topicMatch.reason}`],
      knowledgeGraphId: graph.id,
      canonicalTopicId: null,
      coveredConceptIds: [],
      knowledgeCheckCount: 0,
    };
  }

  const topic = topicMatch.topic;
  const lessonText = JSON.stringify(input.lesson);

  if (!matchTopic(graph, input.lesson.title).topic && !input.lesson.title.toLowerCase().includes(topic.title.toLowerCase().slice(0, 12))) {
    // Soft canonical check — title should relate to topic
    const titleTokens = topic.title.toLowerCase().split(/\s+/).filter((token) => token.length > 3);
    const lessonTitle = input.lesson.title.toLowerCase();
    const overlap = titleTokens.filter((token) => lessonTitle.includes(token)).length;
    if (overlap === 0) {
      reasons.push(`Lesson title does not appear to teach canonical topic "${topic.title}".`);
    }
  }

  const { covered, missing } = conceptCoverage(topic, input.lesson);
  const minCoverage = Math.min(3, Math.ceil(topic.concepts.length * 0.4));
  if (covered.length < minCoverage) {
    reasons.push(
      `Insufficient core concept coverage (${covered.length}/${topic.concepts.length}). Missing examples: ${missing.slice(0, 4).join(", ")}.`,
    );
  }

  if (!practicalLinkedToTopic(topic, input.lesson)) {
    reasons.push("Practical artifact is not linked to KG topic concepts/seeds.");
  }

  if (!authenticMistakes(topic, input.lesson)) {
    reasons.push("Lesson mistakes are not authentic to the KG topic domain.");
  }

  const contamination = detectDomainContamination({
    content: lessonText,
    goalCategory: input.goalCategory,
    graph,
    topic,
  });
  for (const issue of contamination) {
    reasons.push(issue.reason);
  }

  const checkCount = countLessonKnowledgeChecks(input.lesson);
  if (checkCount !== REQUIRED_LESSON_KNOWLEDGE_CHECKS) {
    reasons.push(
      `Lesson must contain exactly ${REQUIRED_LESSON_KNOWLEDGE_CHECKS} knowledge checks across sections (found ${checkCount}).`,
    );
  }

  const checkText = input.lesson.sections
    .flatMap((section) => section.knowledgeCheck.map((check) => check.question))
    .join("\n");

  if (OBJECTIVE_ECHO_PATTERN.test(checkText) || OBJECTIVE_ECHO_PATTERN.test(lessonText)) {
    reasons.push("Lesson contains objective-echo style assessment prompts.");
  }

  if (GENERIC_STUDY_PATTERN.test(checkText) || GENERIC_STUDY_PATTERN.test(lessonText)) {
    reasons.push("Lesson contains generic study-advice content.");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    knowledgeGraphId: graph.id,
    canonicalTopicId: topic.id,
    coveredConceptIds: covered,
    knowledgeCheckCount: checkCount,
  };
}

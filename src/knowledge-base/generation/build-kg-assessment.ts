import { getKnowledgeGraphById } from "@/knowledge-base/registry/knowledge-graph-registry";
import { matchTopic } from "@/knowledge-base/registry/match-topic";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import type {
  AssessmentSkill,
  AssessmentSkillType,
  KgAssessmentQuestion,
  KnowledgeConcept,
  KnowledgeGraph,
  KnowledgeTopic,
} from "@/knowledge-base/schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface BuildKgAssessmentInput {
  topicId: string;
  knowledgeGraphId?: string;
  goalTitle?: string;
  goalCategory?: GoalCategory;
  aliases?: string[];
  graph?: KnowledgeGraph | null;
}

export type KgAssessmentResult =
  | {
      ok: true;
      questions: KgAssessmentQuestion[];
      knowledgeGraphId: string;
      canonicalTopicId: string;
    }
  | {
      ok: false;
      reason: string;
    };

function resolveGraph(input: BuildKgAssessmentInput): KnowledgeGraph | null {
  if (input.graph) {
    return input.graph;
  }
  if (input.knowledgeGraphId) {
    return getKnowledgeGraphById(input.knowledgeGraphId) ?? null;
  }
  if (input.goalTitle && input.goalCategory) {
    const resolved = resolveKnowledgeGraph(
      input.goalTitle,
      input.goalCategory,
      input.aliases ?? [],
    );
    return resolved.status === "resolved" ? resolved.graph : null;
  }
  return null;
}

function findTopic(graph: KnowledgeGraph, topicId: string): KnowledgeTopic | null {
  return graph.topics.find((topic) => topic.id === topicId) ?? matchTopic(graph, topicId).topic;
}

function conceptById(topic: KnowledgeTopic, conceptId: string): KnowledgeConcept | undefined {
  return topic.concepts.find((concept) => concept.id === conceptId);
}

function pickSkills(topic: KnowledgeTopic): AssessmentSkill[] {
  const skills = [...topic.assessmentSkills];
  const selected: AssessmentSkill[] = [];
  const usedConcepts = new Set<string>();
  const usedTypes = new Set<AssessmentSkillType>();

  // Prefer unique concepts and types.
  for (const skill of skills) {
    if (selected.length >= 5) break;
    if (usedConcepts.has(skill.conceptId) && usedConcepts.size < Math.min(5, topic.concepts.length)) {
      continue;
    }
    selected.push(skill);
    usedConcepts.add(skill.conceptId);
    usedTypes.add(skill.skill);
  }

  for (const skill of skills) {
    if (selected.length >= 5) break;
    if (selected.some((entry) => entry.id === skill.id)) continue;
    if (!usedTypes.has(skill.skill) || usedTypes.size < 3) {
      selected.push(skill);
      usedConcepts.add(skill.conceptId);
      usedTypes.add(skill.skill);
    }
  }

  for (const skill of skills) {
    if (selected.length >= 5) break;
    if (selected.some((entry) => entry.id === skill.id)) continue;
    selected.push(skill);
  }

  // Fallback: synthesize from concepts if fewer than 5 skills.
  const fallbackTypes: AssessmentSkillType[] = [
    "concept-understanding",
    "code-interpretation",
    "debugging",
    "expected-output",
    "practical-scenario",
  ];
  let index = 0;
  while (selected.length < 5) {
    const concept = topic.concepts[index % topic.concepts.length]!;
    selected.push({
      id: `${topic.id}-synth-${index + 1}`,
      conceptId: concept.id,
      skill: fallbackTypes[index % fallbackTypes.length]!,
      difficulty: concept.difficulty,
      prerequisiteIds: concept.prerequisiteConceptIds,
    });
    index += 1;
  }

  return selected.slice(0, 5);
}

function stemFor(
  skill: AssessmentSkill,
  concept: KnowledgeConcept,
  topic: KnowledgeTopic,
  index: number,
): string {
  const title = concept.title;
  switch (skill.skill) {
    case "code-interpretation":
      return `What does the following ${topic.title} snippet demonstrate about ${title}?`.slice(0, 300);
    case "query-interpretation":
      return `Which interpretation of a ${title} query in ${topic.title} is correct?`.slice(0, 300);
    case "debugging":
      return `A learner sees broken behavior around ${title} in ${topic.title}. What is the most likely cause?`.slice(
        0,
        300,
      );
    case "expected-output":
      return `When ${title} is applied correctly in ${topic.title}, what result should you expect?`.slice(
        0,
        300,
      );
    case "configuration-analysis":
      return `Which configuration choice correctly applies ${title} for ${topic.title}?`.slice(0, 300);
    case "practical-scenario":
      return `In a practical ${topic.title} scenario requiring ${title}, which action is correct?`.slice(
        0,
        300,
      );
    case "calculation":
      return `Which calculation involving ${title} in ${topic.title} is correct?`.slice(0, 300);
    case "architecture-reasoning":
      return `Which architectural reasoning about ${title} within ${topic.title} is sound?`.slice(
        0,
        300,
      );
    case "concept-understanding":
    default:
      return `Which statement correctly defines ${title} as used in ${topic.title} (item ${index + 1})?`.slice(
        0,
        300,
      );
  }
}

function optionsFor(
  skill: AssessmentSkill,
  concept: KnowledgeConcept,
  topic: KnowledgeTopic,
  correctIndex: 0 | 1 | 2 | 3,
): [string, string, string, string] {
  const correct = `${concept.title}: ${concept.description}`.slice(0, 200);
  const others = topic.concepts
    .filter((entry) => entry.id !== concept.id)
    .slice(0, 3)
    .map((entry, offset) => {
      switch (skill.skill) {
        case "debugging":
          return `Blaming ${entry.title} when ${concept.title} is the actual fault`.slice(0, 200);
        case "expected-output":
          return `Expecting an output governed by ${entry.title} instead of ${concept.title}`.slice(
            0,
            200,
          );
        case "practical-scenario":
          return `Solving the scenario with ${entry.title} while skipping ${concept.title}`.slice(
            0,
            200,
          );
        default:
          return `${entry.title} is interchangeable with ${concept.title} (false claim ${offset + 1})`.slice(
            0,
            200,
          );
      }
    });

  while (others.length < 3) {
    others.push(
      `Incorrect alternative about ${concept.title} in ${topic.title} #${others.length + 1}`.slice(
        0,
        200,
      ),
    );
  }

  const unordered = [correct, others[0]!, others[1]!, others[2]!];
  if (correctIndex === 0) {
    return unordered as [string, string, string, string];
  }
  const arranged = [...unordered];
  const tmp = arranged[0]!;
  arranged[0] = arranged[correctIndex]!;
  arranged[correctIndex] = tmp;
  return arranged as [string, string, string, string];
}

/**
 * Build a deterministic 5-question assessment grounded in KG assessment skills.
 */
export function buildKgAssessment(input: BuildKgAssessmentInput): KgAssessmentResult {
  const graph = resolveGraph(input);
  if (!graph) {
    return {
      ok: false,
      reason: "Unable to resolve knowledge graph for assessment generation.",
    };
  }

  const topic = findTopic(graph, input.topicId);
  if (!topic) {
    return {
      ok: false,
      reason: `Topic "${input.topicId}" not found in ${graph.id}.`,
    };
  }

  const skills = pickSkills(topic);
  const questions: KgAssessmentQuestion[] = skills.map((skill, index) => {
    const concept = conceptById(topic, skill.conceptId) ?? topic.concepts[index % topic.concepts.length]!;
    const correctIndex = (index % 4) as 0 | 1 | 2 | 3;
    return {
      id: `${topic.id}-kg-q${index + 1}`,
      question: stemFor(skill, concept, topic, index),
      options: optionsFor(skill, concept, topic, correctIndex),
      correctIndex,
      explanation: `${concept.title} is correct because ${concept.description}`.slice(0, 400),
      conceptId: concept.id,
      difficulty: skill.difficulty,
      questionType: skill.skill,
      sourceTopicId: topic.id,
      prerequisiteIds: skill.prerequisiteIds.length
        ? skill.prerequisiteIds
        : concept.prerequisiteConceptIds,
    };
  });

  return {
    ok: true,
    questions,
    knowledgeGraphId: graph.id,
    canonicalTopicId: topic.id,
  };
}

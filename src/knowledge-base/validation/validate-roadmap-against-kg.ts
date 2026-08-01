import { matchTopic } from "@/knowledge-base/registry/match-topic";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import type { KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import { detectDomainContamination } from "@/knowledge-base/validation/detect-domain-contamination";
import { detectTopicDuplicates } from "@/knowledge-base/validation/detect-topic-duplicates";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface RoadmapTopicInput {
  title: string;
  /** Optional AI-provided ordering hint (1-based). */
  order?: number;
}

export interface NormalizedKgRoadmapTopic {
  sourceTitle: string;
  canonicalTopicId: string;
  canonicalTitle: string;
  knowledgeGraphId: string;
  prerequisiteIds: string[];
  relatedTopicIds: string[];
  confidence: number;
  learningOrder: number;
}

export interface RoadmapKgValidationResult {
  ok: boolean;
  knowledgeGraphId: string | null;
  reasons: string[];
  normalizedTopics: NormalizedKgRoadmapTopic[];
  unsupportedCurriculum?: boolean;
}

function prerequisitesSatisfied(
  topic: KnowledgeTopic,
  seenIds: Set<string>,
): boolean {
  return topic.prerequisiteIds.every((id) => seenIds.has(id));
}

/**
 * Validate AI roadmap topics against the resolved knowledge graph.
 * Phase 1 validates only — provider failover / deterministic rebuild is Phase 3.
 */
export function validateRoadmapAgainstKg(input: {
  goalTitle: string;
  goalCategory: GoalCategory;
  aliases?: string[];
  topics: RoadmapTopicInput[];
  graph?: KnowledgeGraph | null;
}): RoadmapKgValidationResult {
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
      knowledgeGraphId: null,
      reasons: [resolved.reason],
      normalizedTopics: [],
      unsupportedCurriculum: resolved.status === "unsupported",
    };
  }

  const graph = resolved.graph;
  const titles = input.topics.map((topic) => topic.title);
  const duplicates = detectTopicDuplicates(titles);
  for (const duplicate of duplicates) {
    reasons.push(
      `Duplicate topics: "${duplicate.leftTitle}" ~ "${duplicate.rightTitle}".`,
    );
  }

  const contamination = detectDomainContamination({
    content: titles.join("\n"),
    goalCategory: input.goalCategory,
    graph,
  });
  for (const issue of contamination) {
    reasons.push(issue.reason);
  }

  const normalizedTopics: NormalizedKgRoadmapTopic[] = [];
  const seenCanonicalIds = new Set<string>();
  const topicById = new Map(graph.topics.map((topic) => [topic.id, topic]));

  for (const [index, topicInput] of input.topics.entries()) {
    const match = matchTopic(graph, topicInput.title);
    if (!match.topic) {
      reasons.push(
        `Unrelated or low-confidence topic "${topicInput.title}" (refusing AWS/VPC/unrelated defaults). ${match.reason}`,
      );
      continue;
    }

    if (seenCanonicalIds.has(match.topic.id)) {
      reasons.push(`Canonical topic ${match.topic.id} appears more than once.`);
      continue;
    }

    if (!prerequisitesSatisfied(match.topic, seenCanonicalIds)) {
      const missing = match.topic.prerequisiteIds.filter((id) => !seenCanonicalIds.has(id));
      // Allow if all missing prereqs appear later? No — must appear before.
      // Also allow if missing prereqs are not in the proposed roadmap at all but earlier topics cover them?
      // Spec: prerequisites appear before dependent topics.
      const earlierTitles = input.topics.slice(0, index).map((topic) => topic.title);
      const earlierIds = new Set(
        earlierTitles
          .map((title) => matchTopic(graph, title).topic?.id)
          .filter((id): id is string => Boolean(id)),
      );
      const stillMissing = match.topic.prerequisiteIds.filter((id) => !earlierIds.has(id));
      if (stillMissing.length > 0) {
        reasons.push(
          `Topic "${match.topic.title}" appears before prerequisites: ${stillMissing
            .map((id) => topicById.get(id)?.title ?? id)
            .join(", ")}.`,
        );
      }
    }

    seenCanonicalIds.add(match.topic.id);
    normalizedTopics.push({
      sourceTitle: topicInput.title,
      canonicalTopicId: match.topic.id,
      canonicalTitle: match.topic.title,
      knowledgeGraphId: graph.id,
      prerequisiteIds: match.topic.prerequisiteIds,
      relatedTopicIds: match.topic.relatedTopicIds,
      confidence: match.confidence,
      learningOrder: match.topic.learningOrder,
    });
  }

  // Coherent learning order: canonical learningOrder should be non-decreasing.
  for (let i = 1; i < normalizedTopics.length; i += 1) {
    const prev = normalizedTopics[i - 1]!;
    const curr = normalizedTopics[i]!;
    if (curr.learningOrder < prev.learningOrder) {
      reasons.push(
        `Learning order regression: "${curr.canonicalTitle}" (order ${curr.learningOrder}) after "${prev.canonicalTitle}" (order ${prev.learningOrder}).`,
      );
    }
  }

  const ok =
    reasons.length === 0 &&
    normalizedTopics.length === input.topics.length &&
    input.topics.length > 0;

  if (input.topics.length === 0) {
    reasons.push("Roadmap contains no topics.");
  }

  return {
    ok,
    knowledgeGraphId: graph.id,
    reasons,
    normalizedTopics,
  };
}

import { getKnowledgeGraphById } from "@/knowledge-base/registry/knowledge-graph-registry";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import type { KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import type { NormalizedKgRoadmapTopic } from "@/knowledge-base/validation";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import { slugifyTitle } from "@/lib/ai/slug-id";

export interface KgRoadmapTaskDraft {
  title: string;
  type: "lesson" | "quiz" | "lab";
  durationMinutes: number;
  description: string;
  learningObjectives: string[];
  canonicalTopicId: string;
}

/** Intermediate milestone shape mappable to AiRoadmapMilestone / Roadmap without provider wiring. */
export interface KgRoadmapMilestone {
  order: number;
  week: number;
  title: string;
  description: string;
  topicTitle: string;
  canonicalTopicId: string;
  knowledgeGraphId: string;
  prerequisiteIds: string[];
  relatedTopicIds: string[];
  learningOrder: number;
  tasks: KgRoadmapTaskDraft[];
}

export interface KgProposedGraphDraft {
  suggestedId: string;
  suggestedTitle: string;
  categoryHint: GoalCategory;
  notes: string;
  seedTopicTitles: string[];
}

export type KgRoadmapResult =
  | {
      ok: true;
      knowledgeGraphId: string;
      graphTitle: string;
      topics: NormalizedKgRoadmapTopic[];
      milestones: KgRoadmapMilestone[];
    }
  | {
      ok: false;
      reason: "unsupported-curriculum" | "ambiguous-curriculum";
      message: string;
      proposedGraphDraft?: KgProposedGraphDraft;
    };

export interface BuildKgRoadmapInput {
  goalTitle: string;
  goalCategory: GoalCategory;
  aliases?: string[];
  /** Optional pre-resolved graph (skips registry resolve). */
  graph?: KnowledgeGraph | null;
  knowledgeGraphId?: string;
}

function orderedTopics(graph: KnowledgeGraph): KnowledgeTopic[] {
  const byId = new Map(graph.topics.map((topic) => [topic.id, topic]));
  const remaining = new Set(graph.topics.map((topic) => topic.id));
  const ordered: KnowledgeTopic[] = [];

  while (remaining.size > 0) {
    // Emit one topic at a time (lowest learningOrder among ready) so parallel
    // branches cannot place a higher learningOrder before a lower sibling.
    const next = [...remaining]
      .map((id) => byId.get(id)!)
      .filter((topic) => topic.prerequisiteIds.every((prereq) => !remaining.has(prereq)))
      .sort((a, b) => a.learningOrder - b.learningOrder || a.id.localeCompare(b.id))[0];

    if (!next) {
      // Cycle / bad graph — fall back to learningOrder only.
      return [...graph.topics].sort(
        (a, b) => a.learningOrder - b.learningOrder || a.id.localeCompare(b.id),
      );
    }

    ordered.push(next);
    remaining.delete(next.id);
  }

  return ordered;
}

function buildTasks(topic: KnowledgeTopic): KgRoadmapTaskDraft[] {
  const objectives = topic.learningObjectives.slice(0, 3);
  return [
    {
      title: `Lesson: ${topic.title}`,
      type: "lesson",
      durationMinutes: topic.difficulty === "advanced" ? 45 : topic.difficulty === "intermediate" ? 35 : 25,
      description: `Study ${topic.title} using canonical concepts and a practical artifact.`,
      learningObjectives: objectives,
      canonicalTopicId: topic.id,
    },
    {
      title: `Lab: ${topic.exercises[0]?.title ?? topic.title}`,
      type: "lab",
      durationMinutes: 30,
      description: topic.exercises[0]?.expectedOutcome ?? `Complete a hands-on exercise for ${topic.title}.`,
      learningObjectives: objectives.slice(0, 2),
      canonicalTopicId: topic.id,
    },
    {
      title: `Quiz: ${topic.title}`,
      type: "quiz",
      durationMinutes: 15,
      description: `Check understanding across ${Math.min(5, topic.concepts.length)} concepts in ${topic.title}.`,
      learningObjectives: objectives.slice(0, 2),
      canonicalTopicId: topic.id,
    },
  ];
}

function buildProposedDraft(
  goalTitle: string,
  goalCategory: GoalCategory,
): KgProposedGraphDraft {
  const slug = slugifyTitle(goalTitle) || "unsupported-topic";
  const base = goalTitle.trim() || "Unsupported Topic";
  return {
    suggestedId: `kg-${slug}`.slice(0, 120),
    suggestedTitle: base,
    categoryHint: goalCategory,
    notes:
      "No registered knowledge graph matched this goal with high confidence. " +
      "Do not map to AWS/VPC/Foundations defaults. Review and author a dedicated graph before generation.",
    seedTopicTitles: [
      `${base}: Essential Techniques`,
      `${base}: Practical Workflow`,
      `${base}: Common Pitfalls`,
      `${base}: Applied Project`,
    ],
  };
}

/**
 * Build a deterministic, prerequisite-ordered roadmap from a resolved knowledge graph.
 * Unsupported / ambiguous goals return an explicit failure — never silent wrong-domain mapping.
 */
export function buildKgRoadmap(input: BuildKgRoadmapInput): KgRoadmapResult {
  let graph: KnowledgeGraph | null = input.graph ?? null;

  if (!graph && input.knowledgeGraphId) {
    graph = getKnowledgeGraphById(input.knowledgeGraphId) ?? null;
    if (!graph) {
      return {
        ok: false,
        reason: "unsupported-curriculum",
        message: `Unknown knowledgeGraphId "${input.knowledgeGraphId}".`,
        proposedGraphDraft: buildProposedDraft(input.goalTitle, input.goalCategory),
      };
    }
  }

  if (!graph) {
    const resolved = resolveKnowledgeGraph(
      input.goalTitle,
      input.goalCategory,
      input.aliases ?? [],
    );

    if (resolved.status === "ambiguous") {
      return {
        ok: false,
        reason: "ambiguous-curriculum",
        message: resolved.reason,
        proposedGraphDraft: buildProposedDraft(input.goalTitle, input.goalCategory),
      };
    }

    if (resolved.status !== "resolved" || !resolved.graph) {
      return {
        ok: false,
        reason: "unsupported-curriculum",
        message: resolved.reason,
        proposedGraphDraft: buildProposedDraft(input.goalTitle, input.goalCategory),
      };
    }

    graph = resolved.graph;
  }

  const sequence = orderedTopics(graph);
  const seen = new Set<string>();
  const topics: NormalizedKgRoadmapTopic[] = [];
  const milestones: KgRoadmapMilestone[] = [];

  for (const [index, topic] of sequence.entries()) {
    if (seen.has(topic.id)) {
      continue;
    }
    seen.add(topic.id);

    topics.push({
      sourceTitle: topic.title,
      canonicalTopicId: topic.id,
      canonicalTitle: topic.title,
      knowledgeGraphId: graph.id,
      prerequisiteIds: topic.prerequisiteIds,
      relatedTopicIds: topic.relatedTopicIds,
      confidence: 1,
      learningOrder: topic.learningOrder,
    });

    const week = Math.min(16, Math.floor(index / 2) + 1);
    milestones.push({
      order: index + 1,
      week,
      title: `Week ${week}: ${topic.title}`,
      description: topic.description,
      topicTitle: topic.title,
      canonicalTopicId: topic.id,
      knowledgeGraphId: graph.id,
      prerequisiteIds: topic.prerequisiteIds,
      relatedTopicIds: topic.relatedTopicIds,
      learningOrder: topic.learningOrder,
      tasks: buildTasks(topic),
    });
  }

  return {
    ok: true,
    knowledgeGraphId: graph.id,
    graphTitle: graph.title,
    topics,
    milestones,
  };
}

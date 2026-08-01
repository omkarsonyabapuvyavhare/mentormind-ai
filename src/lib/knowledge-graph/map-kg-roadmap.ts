import { addWeeks, parseISO } from "date-fns";

import type { KgRoadmapMilestone, KgRoadmapResult } from "@/knowledge-base/generation";
import type { NormalizedKgRoadmapTopic } from "@/knowledge-base/validation";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import { buildMilestoneId, buildTaskId, slugifyTitle } from "@/lib/ai/slug-id";
import type { AiRoadmapMilestone } from "@/lib/ai/roadmap-schema";
import type { Roadmap, TaskType } from "@/types/roadmap";

function toIso(date: Date): string {
  return date.toISOString();
}

function expectedMilestoneCount(durationWeeks: number): number {
  return Math.min(Math.max(durationWeeks, 4), 8);
}

function distributeWeeks(count: number, durationWeeks: number): number[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [1];
  }

  const weeks: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const week = Math.min(
      durationWeeks,
      Math.max(1, Math.round(((index + 1) / count) * durationWeeks)),
    );
    weeks.push(week);
  }

  for (let index = 1; index < weeks.length; index += 1) {
    if (weeks[index]! <= weeks[index - 1]!) {
      weeks[index] = Math.min(durationWeeks, weeks[index - 1]! + 1);
    }
  }

  return weeks;
}

/** Map KG milestones into AiRoadmapMilestone shape (for shared builders / tests). */
export function kgMilestonesToAiMilestones(
  milestones: KgRoadmapMilestone[],
  durationWeeks: number,
): AiRoadmapMilestone[] {
  const capped = expectedMilestoneCount(durationWeeks);
  const selected = milestones.slice(0, capped);
  const weeks = distributeWeeks(selected.length, Math.min(Math.max(durationWeeks, 4), 16));

  return selected.map((milestone, index) => ({
    title: milestone.title,
    description: milestone.description,
    week: weeks[index] ?? milestone.week,
    topicTitle: milestone.topicTitle,
    tasks: milestone.tasks.map((task) => ({
      title: task.title,
      type: task.type,
      durationMinutes: task.durationMinutes,
      description: task.description,
      learningObjectives: task.learningObjectives,
    })),
  }));
}

/**
 * Build an app Roadmap from a successful buildKgRoadmap result.
 * Preserves ms-week-* / task-* ID patterns and unlock rules from AI mapping.
 */
export function buildRoadmapFromKgResult(
  kgResult: Extract<KgRoadmapResult, { ok: true }>,
  goalId: string,
  twinId: string,
  startTimestamp: string,
  durationWeeks: number,
): Roadmap {
  const milestones = kgMilestonesToAiMilestones(kgResult.milestones, durationWeeks);
  const topicByCanonical = new Map(
    kgResult.topics.map((topic) => [topic.canonicalTopicId, topic]),
  );

  return buildRoadmapFromCanonicalMilestones({
    milestones,
    topicLookup: (topicTitle) => {
      const direct = kgResult.topics.find(
        (topic) =>
          topic.canonicalTitle === topicTitle ||
          topic.sourceTitle === topicTitle ||
          topic.canonicalTopicId === topicTitle,
      );
      if (direct) {
        return direct;
      }
      const slug = slugifyTitle(topicTitle);
      return (
        kgResult.topics.find((topic) => topic.canonicalTopicId === slug) ??
        topicByCanonical.get(slug) ??
        null
      );
    },
    knowledgeGraphId: kgResult.knowledgeGraphId,
    goalId,
    twinId,
    startTimestamp,
  });
}

/**
 * Remap AI milestones that already passed KG validation onto canonical topic IDs.
 */
export function buildRoadmapFromValidatedAiMilestones(
  milestones: AiRoadmapMilestone[],
  normalizedTopics: NormalizedKgRoadmapTopic[],
  knowledgeGraphId: string,
  goalId: string,
  twinId: string,
  startTimestamp: string,
): Roadmap {
  const bySource = new Map(
    normalizedTopics.map((topic) => [topic.sourceTitle.trim().toLowerCase(), topic]),
  );

  const remapped: AiRoadmapMilestone[] = milestones.map((milestone) => {
    const normalized =
      bySource.get(milestone.topicTitle.trim().toLowerCase()) ??
      normalizedTopics.find(
        (topic) => slugifyTitle(topic.sourceTitle) === slugifyTitle(milestone.topicTitle),
      );

    return {
      ...milestone,
      topicTitle: normalized?.canonicalTitle ?? milestone.topicTitle,
    };
  });

  return buildRoadmapFromCanonicalMilestones({
    milestones: remapped,
    topicLookup: (topicTitle) => {
      const lower = topicTitle.trim().toLowerCase();
      return (
        normalizedTopics.find(
          (topic) =>
            topic.canonicalTitle.toLowerCase() === lower ||
            topic.sourceTitle.toLowerCase() === lower,
        ) ?? null
      );
    },
    knowledgeGraphId,
    goalId,
    twinId,
    startTimestamp,
  });
}

function buildRoadmapFromCanonicalMilestones(input: {
  milestones: AiRoadmapMilestone[];
  topicLookup: (topicTitle: string) => NormalizedKgRoadmapTopic | null;
  knowledgeGraphId: string;
  goalId: string;
  twinId: string;
  startTimestamp: string;
}): Roadmap {
  const startDate = parseISO(input.startTimestamp);
  const normalizedMilestones = [...input.milestones].sort((a, b) => a.week - b.week);
  const firstWeek = normalizedMilestones[0]?.week ?? 1;
  const unlockThroughWeek = Math.min(
    firstWeek,
    normalizedMilestones.at(-1)?.week ?? firstWeek,
  );

  const roadmapMilestones = normalizedMilestones.map((milestone) => {
    const matched = input.topicLookup(milestone.topicTitle);
    const topicId = matched?.canonicalTopicId ?? slugifyTitle(milestone.topicTitle);
    const milestoneId = buildMilestoneId(milestone.week);

    return {
      id: milestoneId,
      title: milestone.title,
      targetDate: toIso(addWeeks(startDate, milestone.week)),
      status:
        milestone.week === firstWeek
          ? ("current" as const)
          : ("upcoming" as const),
      topicIds: [topicId],
      order: milestone.week,
      knowledgeGraphId: input.knowledgeGraphId,
      canonicalTopicId: matched?.canonicalTopicId ?? topicId,
      prerequisiteIds: matched?.prerequisiteIds ?? [],
      relatedTopicIds: matched?.relatedTopicIds ?? [],
      kgValidationVersion: KG_VALIDATION_VERSION,
    };
  });

  const tasks = normalizedMilestones.flatMap((milestone) => {
    const milestoneId = buildMilestoneId(milestone.week);
    const matched = input.topicLookup(milestone.topicTitle);
    const topicId = matched?.canonicalTopicId ?? slugifyTitle(milestone.topicTitle);
    const unlocked = milestone.week <= unlockThroughWeek;

    return milestone.tasks.map((task, index) => ({
      id: buildTaskId(milestoneId, topicId, task.type, index),
      milestoneId,
      topicId,
      type: task.type as TaskType,
      title: task.title,
      estimatedMinutes: task.durationMinutes,
      status: "pending" as const,
      priority: index + 1,
      unlocked,
      learningObjectives: task.learningObjectives,
      knowledgeGraphId: input.knowledgeGraphId,
      canonicalTopicId: matched?.canonicalTopicId ?? topicId,
      prerequisiteIds: matched?.prerequisiteIds ?? [],
      relatedTopicIds: matched?.relatedTopicIds ?? [],
      kgValidationVersion: KG_VALIDATION_VERSION,
    }));
  });

  return {
    id: `roadmap-${input.twinId}`,
    goalId: input.goalId,
    milestones: roadmapMilestones,
    tasks,
    version: 1,
    updatedAt: input.startTimestamp,
    knowledgeGraphId: input.knowledgeGraphId,
    kgValidationVersion: KG_VALIDATION_VERSION,
  };
}

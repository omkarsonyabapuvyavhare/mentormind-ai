import { z } from "zod";

import { knowledgeTopicSchema } from "@/knowledge-base/schema/topic-schema";
import { goalCategorySchema } from "@/lib/goals/goal-identity";

export const knowledgeGraphSchema = z
  .object({
    id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(200),
    aliases: z.array(z.string().min(1).max(120)).min(1).max(40),
    category: goalCategorySchema,
    description: z.string().min(1).max(800),
    topics: z.array(knowledgeTopicSchema).min(1).max(24),
  })
  .superRefine((graph, ctx) => {
    const topicIds = new Set(graph.topics.map((topic) => topic.id));
    if (topicIds.size !== graph.topics.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Knowledge graph topic IDs must be unique.",
        path: ["topics"],
      });
    }

    for (const topic of graph.topics) {
      for (const prerequisiteId of topic.prerequisiteIds) {
        if (!topicIds.has(prerequisiteId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Topic ${topic.id} references unknown prerequisite ${prerequisiteId}`,
            path: ["topics"],
          });
        }
      }
    }
  });

export type KnowledgeGraph = z.infer<typeof knowledgeGraphSchema>;

/** Bumped only when validation semantics change (Phase 3 cache wiring). */
export const KG_VALIDATION_VERSION = "kg-v1";

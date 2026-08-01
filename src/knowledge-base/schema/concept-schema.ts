import { z } from "zod";

import {
  assessmentSkillSchema,
  difficultyLevelSchema,
} from "@/knowledge-base/schema/assessment-skill-schema";

export { difficultyLevelSchema };
export type { DifficultyLevel } from "@/knowledge-base/schema/assessment-skill-schema";

export const conceptExampleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  language: z.string().min(1).max(64).optional(),
  explanation: z.string().min(1).max(800).optional(),
});

export type ConceptExample = z.infer<typeof conceptExampleSchema>;

export const knowledgeConceptSchema = z.object({
  id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(800),
  prerequisiteConceptIds: z.array(z.string().min(1).max(120)).max(12),
  relatedConceptIds: z.array(z.string().min(1).max(120)).max(12),
  difficulty: difficultyLevelSchema,
  examples: z.array(conceptExampleSchema).min(0).max(6),
  commonMistakes: z.array(z.string().min(1).max(300)).min(0).max(6),
  assessmentSkills: z.array(assessmentSkillSchema).min(0).max(12),
});

export type KnowledgeConcept = z.infer<typeof knowledgeConceptSchema>;

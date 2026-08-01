import { z } from "zod";

import { assessmentSkillSchema } from "@/knowledge-base/schema/assessment-skill-schema";
import { difficultyLevelSchema, knowledgeConceptSchema } from "@/knowledge-base/schema/concept-schema";
import { practicalArtifactTypeSchema } from "@/lib/ai/lesson-schema";

export const practicalArtifactSeedSchema = z.object({
  id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: practicalArtifactTypeSchema,
  title: z.string().min(1).max(200),
  language: z.string().min(1).max(64).optional(),
  content: z.string().min(1).max(4000),
  expectedOutput: z.string().min(1).max(2000).optional(),
  explanation: z.string().min(1).max(1200),
  conceptIds: z.array(z.string().min(1).max(120)).min(1).max(8),
});

export type PracticalArtifactSeed = z.infer<typeof practicalArtifactSeedSchema>;

export const commonMistakeSeedSchema = z.object({
  id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  mistake: z.string().min(1).max(300),
  whyItHappens: z.string().min(1).max(400),
  correction: z.string().min(1).max(400),
  conceptIds: z.array(z.string().min(1).max(120)).min(0).max(6),
});

export type CommonMistakeSeed = z.infer<typeof commonMistakeSeedSchema>;

export const practicalExerciseSeedSchema = z.object({
  id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  instructions: z.array(z.string().min(1).max(400)).min(1).max(8),
  hints: z.array(z.string().min(1).max(300)).min(1).max(4),
  expectedOutcome: z.string().min(1).max(600),
  starterContent: z.string().min(1).max(4000).optional(),
  conceptIds: z.array(z.string().min(1).max(120)).min(1).max(8),
  difficulty: difficultyLevelSchema,
});

export type PracticalExerciseSeed = z.infer<typeof practicalExerciseSeedSchema>;

export const knowledgeTopicSchema = z
  .object({
    id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(200),
    aliases: z.array(z.string().min(1).max(120)).min(0).max(20),
    description: z.string().min(1).max(800),
    difficulty: difficultyLevelSchema,
    learningOrder: z.number().int().min(1).max(100),
    prerequisiteIds: z.array(z.string().min(1).max(120)).max(12),
    relatedTopicIds: z.array(z.string().min(1).max(120)).max(12),
    concepts: z.array(knowledgeConceptSchema).min(4).max(12),
    learningObjectives: z.array(z.string().min(1).max(200)).min(2).max(8),
    practicalArtifacts: z.array(practicalArtifactSeedSchema).min(1).max(3),
    commonMistakes: z.array(commonMistakeSeedSchema).min(2).max(4),
    exercises: z.array(practicalExerciseSeedSchema).min(1).max(3),
    assessmentSkills: z.array(assessmentSkillSchema).min(5).max(24),
    contaminationTerms: z.array(z.string().min(1).max(64)).max(40).optional(),
  })
  .superRefine((topic, ctx) => {
    const conceptIds = new Set(topic.concepts.map((concept) => concept.id));
    for (const skill of topic.assessmentSkills) {
      if (!conceptIds.has(skill.conceptId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Assessment skill ${skill.id} references unknown concept ${skill.conceptId}`,
          path: ["assessmentSkills"],
        });
      }
    }
  });

export type KnowledgeTopic = z.infer<typeof knowledgeTopicSchema>;

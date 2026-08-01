import { z } from "zod";

export const difficultyLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;

export const assessmentSkillTypeSchema = z.enum([
  "concept-understanding",
  "code-interpretation",
  "query-interpretation",
  "debugging",
  "expected-output",
  "configuration-analysis",
  "practical-scenario",
  "calculation",
  "architecture-reasoning",
]);

export type AssessmentSkillType = z.infer<typeof assessmentSkillTypeSchema>;

export const assessmentSkillSchema = z.object({
  id: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  conceptId: z.string().min(1).max(120),
  skill: assessmentSkillTypeSchema,
  difficulty: difficultyLevelSchema,
  prerequisiteIds: z.array(z.string().min(1).max(120)).max(12),
});

export type AssessmentSkill = z.infer<typeof assessmentSkillSchema>;

/** Phase-1 assessment question shape used by KG validation (provider wiring deferred). */
export const kgAssessmentQuestionSchema = z.object({
  id: z.string().min(1).max(120),
  question: z.string().min(1).max(300),
  options: z.tuple([
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
  ]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1).max(400),
  conceptId: z.string().min(1).max(120),
  difficulty: difficultyLevelSchema,
  questionType: assessmentSkillTypeSchema,
  sourceTopicId: z.string().min(1).max(120),
  prerequisiteIds: z.array(z.string().min(1).max(120)).max(12),
});

export type KgAssessmentQuestion = z.infer<typeof kgAssessmentQuestionSchema>;

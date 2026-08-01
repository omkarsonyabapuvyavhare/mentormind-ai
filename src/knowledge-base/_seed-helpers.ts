import type { AssessmentSkill, AssessmentSkillType } from "@/knowledge-base/schema";
import type {
  CommonMistakeSeed,
  DifficultyLevel,
  KnowledgeConcept,
  KnowledgeTopic,
  PracticalArtifactSeed,
  PracticalExerciseSeed,
} from "@/knowledge-base/schema";
import type { PracticalArtifactType } from "@/lib/ai/lesson-schema";

export function skill(
  id: string,
  conceptId: string,
  type: AssessmentSkillType,
  difficulty: DifficultyLevel = "beginner",
  prerequisiteIds: string[] = [],
): AssessmentSkill {
  return { id, conceptId, skill: type, difficulty, prerequisiteIds };
}

export function concept(input: {
  id: string;
  title: string;
  description: string;
  difficulty?: DifficultyLevel;
  prerequisiteConceptIds?: string[];
  relatedConceptIds?: string[];
  examples?: KnowledgeConcept["examples"];
  commonMistakes?: string[];
  assessmentSkills?: AssessmentSkill[];
}): KnowledgeConcept {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    difficulty: input.difficulty ?? "beginner",
    prerequisiteConceptIds: input.prerequisiteConceptIds ?? [],
    relatedConceptIds: input.relatedConceptIds ?? [],
    examples: input.examples ?? [],
    commonMistakes: input.commonMistakes ?? [],
    assessmentSkills: input.assessmentSkills ?? [],
  };
}

export function mistake(
  id: string,
  mistakeText: string,
  whyItHappens: string,
  correction: string,
  conceptIds: string[] = [],
): CommonMistakeSeed {
  return { id, mistake: mistakeText, whyItHappens, correction, conceptIds };
}

export function artifact(input: {
  id: string;
  type: PracticalArtifactType;
  title: string;
  content: string;
  explanation: string;
  conceptIds: string[];
  language?: string;
  expectedOutput?: string;
}): PracticalArtifactSeed {
  return {
    id: input.id,
    type: input.type,
    title: input.title,
    language: input.language,
    content: input.content,
    expectedOutput: input.expectedOutput,
    explanation: input.explanation,
    conceptIds: input.conceptIds,
  };
}

export function exercise(input: {
  id: string;
  title: string;
  instructions: string[];
  hints: string[];
  expectedOutcome: string;
  conceptIds: string[];
  difficulty?: DifficultyLevel;
  starterContent?: string;
}): PracticalExerciseSeed {
  return {
    id: input.id,
    title: input.title,
    instructions: input.instructions,
    hints: input.hints,
    expectedOutcome: input.expectedOutcome,
    conceptIds: input.conceptIds,
    difficulty: input.difficulty ?? "beginner",
    starterContent: input.starterContent,
  };
}

export function topic(input: {
  id: string;
  title: string;
  aliases?: string[];
  description: string;
  difficulty?: DifficultyLevel;
  learningOrder: number;
  prerequisiteIds?: string[];
  relatedTopicIds?: string[];
  concepts: KnowledgeConcept[];
  learningObjectives: string[];
  practicalArtifacts: PracticalArtifactSeed[];
  commonMistakes: CommonMistakeSeed[];
  exercises: PracticalExerciseSeed[];
  assessmentSkills: AssessmentSkill[];
  contaminationTerms?: string[];
}): KnowledgeTopic {
  return {
    id: input.id,
    title: input.title,
    aliases: input.aliases ?? [],
    description: input.description,
    difficulty: input.difficulty ?? "beginner",
    learningOrder: input.learningOrder,
    prerequisiteIds: input.prerequisiteIds ?? [],
    relatedTopicIds: input.relatedTopicIds ?? [],
    concepts: input.concepts,
    learningObjectives: input.learningObjectives,
    practicalArtifacts: input.practicalArtifacts,
    commonMistakes: input.commonMistakes,
    exercises: input.exercises,
    assessmentSkills: input.assessmentSkills,
    contaminationTerms: input.contaminationTerms,
  };
}

/** Default five-skill mix for a topic's primary concepts. */
export function defaultTopicSkills(
  prefix: string,
  conceptIds: string[],
  types: AssessmentSkillType[] = [
    "concept-understanding",
    "code-interpretation",
    "debugging",
    "expected-output",
    "practical-scenario",
  ],
): AssessmentSkill[] {
  const skills: AssessmentSkill[] = [];
  const count = Math.max(5, Math.min(conceptIds.length, types.length));
  for (let index = 0; index < count; index += 1) {
    const conceptId = conceptIds[index % conceptIds.length]!;
    const skillType = types[index % types.length]!;
    skills.push(
      skill(
        `${prefix}-${skillType.replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
        conceptId,
        skillType,
        index < 2 ? "beginner" : index < 4 ? "intermediate" : "advanced",
      ),
    );
  }
  return skills;
}

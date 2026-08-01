import { z } from "zod";

import { validateLessonPracticalBlocks } from "@/lib/ai/lesson-practical-validation";
import { validateContentForGoalCategory } from "@/lib/goals/domain-validation";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export const MAX_LESSON_SECTIONS = 8;
export const MAX_KNOWLEDGE_CHECKS_PER_SECTION = 3;
export const REQUIRED_LESSON_KNOWLEDGE_CHECKS = 5;
export const MIN_LESSON_SECTIONS = 6;
export const MAX_WORDS_ESTIMATE = 3200;
export const HANDS_ON_PRACTICE_HEADING = "Hands-on Practice";

export const practicalArtifactTypeSchema = z.enum([
  "code",
  "command",
  "configuration",
  "query",
  "diagram",
  "calculation",
  "workflow",
  "case-study",
]);

export type PracticalArtifactType = z.infer<typeof practicalArtifactTypeSchema>;

export const practicalArtifactSchema = z.object({
  type: practicalArtifactTypeSchema,
  title: z.string().min(1).max(200),
  language: z.string().min(1).max(64).optional(),
  content: z.string().min(1).max(4000),
  expectedOutput: z.string().min(1).max(2000).optional(),
  explanation: z.string().min(1).max(1200),
});

export type PracticalArtifact = z.infer<typeof practicalArtifactSchema>;

export const handsOnExerciseSchema = z.object({
  instructions: z.array(z.string().min(1).max(400)).min(1).max(8),
  starterContent: z.string().min(1).max(4000).optional(),
  hints: z.array(z.string().min(1).max(300)).min(1).max(4),
  expectedOutcome: z.string().min(1).max(600),
  solution: z.string().min(1).max(4000).optional(),
  solutionExplanation: z.string().min(1).max(900),
});

export type HandsOnExercise = z.infer<typeof handsOnExerciseSchema>;

export const handsOnPracticeSchema = z.object({
  exercise: z.string().min(1).max(1200),
  instructions: z.string().min(1).max(1200),
  thinkAbout: z.string().min(1).max(600),
  hints: z.array(z.string().min(1).max(300)).max(4).optional(),
  expectedOutcome: z.string().min(1).max(600),
  solutionExplanation: z.string().min(1).max(900),
});

export type HandsOnPractice = z.infer<typeof handsOnPracticeSchema>;

export const knowledgeCheckSchema = z.object({
  question: z.string().min(1).max(300),
  options: z.tuple([
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
    z.string().min(1).max(200),
  ]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(400),
  conceptTag: z.string().min(1).max(64).optional(),
});

export const lessonSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  content: z.string().min(1).max(2400),
  practicalExample: z.string().min(1).max(900),
  handsOnPractice: handsOnPracticeSchema.optional(),
  commonMistakes: z.array(z.string().min(1).max(300)).min(3).max(5),
  summary: z.array(z.string().min(1).max(300)).min(3).max(5),
  knowledgeCheck: z.array(knowledgeCheckSchema).min(0).max(MAX_KNOWLEDGE_CHECKS_PER_SECTION),
});

export const aiLessonResponseSchema = z.object({
  title: z.string().min(1).max(200),
  estimatedMinutes: z.number().int().min(5).max(120),
  learningObjectives: z.array(z.string().min(1).max(200)).min(1).max(6),
  practicalArtifact: practicalArtifactSchema,
  handsOnExercise: handsOnExerciseSchema,
  sections: z.array(lessonSectionSchema).min(MIN_LESSON_SECTIONS).max(MAX_LESSON_SECTIONS),
});

export type KnowledgeCheck = z.infer<typeof knowledgeCheckSchema>;
export type LessonSection = z.infer<typeof lessonSectionSchema>;
export type AiLessonResponse = z.infer<typeof aiLessonResponseSchema>;

export const lessonGenerationSourceSchema = z.enum(["ai", "deterministic", "cache"]);

export type LessonGenerationSource = z.infer<typeof lessonGenerationSourceSchema>;

export interface GeneratedLesson extends AiLessonResponse {
  topicId: string;
  source: LessonGenerationSource;
  /** Optional Knowledge Graph provenance (Phase 3). */
  knowledgeGraphId?: string;
  canonicalTopicId?: string;
  kgValidationVersion?: string;
}

export function estimateWordCount(lesson: AiLessonResponse): number {
  const parts = [
    lesson.title,
    ...lesson.learningObjectives,
    lesson.practicalArtifact.title,
    lesson.practicalArtifact.content,
    lesson.practicalArtifact.expectedOutput,
    lesson.practicalArtifact.explanation,
    ...lesson.handsOnExercise.instructions,
    lesson.handsOnExercise.starterContent,
    ...lesson.handsOnExercise.hints,
    lesson.handsOnExercise.expectedOutcome,
    lesson.handsOnExercise.solution,
    lesson.handsOnExercise.solutionExplanation,
    ...lesson.sections.flatMap((section) => [
      section.heading,
      section.content,
      section.practicalExample,
      section.handsOnPractice?.exercise,
      section.handsOnPractice?.instructions,
      section.handsOnPractice?.thinkAbout,
      ...(section.handsOnPractice?.hints ?? []),
      section.handsOnPractice?.expectedOutcome,
      section.handsOnPractice?.solutionExplanation,
      ...section.commonMistakes,
      ...section.summary,
      ...section.knowledgeCheck.flatMap((check) => [
        check.question,
        ...check.options,
        check.explanation,
      ]),
    ]),
  ];

  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export interface LessonValidationContext {
  goalSlug: string;
  goalCategory: GoalCategory;
  topicId: string;
  topicTitle: string;
  learningObjectives?: string[];
}

export const GENERIC_LESSON_PHRASES: RegExp[] = [
  /imagine you are explaining/i,
  /trying to memorize/i,
  /anchor your study/i,
  /anchor your learning/i,
  /pick one milestone from your roadmap/i,
  /studying in isolation/i,
  /treat it as unrelated background reading/i,
  /what is the best first step when learning/i,
  /how should .+ connect to your learning plan/i,
  /skipping hands-on practice/i,
  /skipping practice because/i,
  /this topic matters(?!\s+(?:because|when|for|in))/i,
  /memorize every detail without context/i,
  /jump directly to the hardest advanced scenario/i,
];

/** Instructional-design meta language that should not dominate lesson body text. */
export const LESSON_META_LANGUAGE_PATTERNS: RegExp[] = [
  /today you will work through/i,
  /by the end of this session/i,
  /session focus:/i,
  /your roadmap/i,
  /your learning goal/i,
  /learning journey/i,
  /topic check-in/i,
  /passive reading/i,
  /explain key ideas/i,
  /practitioner workflow/i,
  /learn .+ in \d+ weeks/i,
  /milestone in your/i,
  /objectives as a checklist/i,
  /write a three-sentence summary/i,
  /teach .+ back to an imaginary colleague/i,
  /this exercise is scoped for/i,
  /pursuing .+ as part of/i,
  /working toward your goal/i,
  /aligned with your goal/i,
  /use the lesson objectives/i,
];

export type LessonPhraseViolationKind = "generic" | "meta";

export interface LessonPhraseViolation {
  kind: LessonPhraseViolationKind;
  pattern: string;
  match: string;
}

export interface LessonFieldValidationIssue {
  sectionIndex: number;
  sectionHeading: string;
  field: string;
  violations: LessonPhraseViolation[];
}

function collectPhraseViolations(
  text: string,
  patterns: RegExp[],
  kind: LessonPhraseViolationKind,
): LessonPhraseViolation[] {
  const violations: LessonPhraseViolation[] = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[0]) {
      violations.push({ kind, pattern: pattern.source, match: match[0] });
    }
  }

  return violations;
}

export function findLessonPhraseViolations(text: string): LessonPhraseViolation[] {
  return [
    ...collectPhraseViolations(text, GENERIC_LESSON_PHRASES, "generic"),
    ...collectPhraseViolations(text, LESSON_META_LANGUAGE_PATTERNS, "meta"),
  ];
}

export function findLessonValidationIssues(
  sections: LessonSection[],
): LessonFieldValidationIssue[] {
  const issues: LessonFieldValidationIssue[] = [];

  sections.forEach((section, sectionIndex) => {
    const scalarFields: Array<[string, string | undefined]> = [
      ["content", section.content],
      ["practicalExample", section.practicalExample],
      ["handsOnPractice.exercise", section.handsOnPractice?.exercise],
      ["handsOnPractice.instructions", section.handsOnPractice?.instructions],
      ["handsOnPractice.thinkAbout", section.handsOnPractice?.thinkAbout],
      ["handsOnPractice.expectedOutcome", section.handsOnPractice?.expectedOutcome],
      ["handsOnPractice.solutionExplanation", section.handsOnPractice?.solutionExplanation],
    ];

    for (const [field, value] of scalarFields) {
      if (!value) {
        continue;
      }

      const violations = findLessonPhraseViolations(value);

      if (violations.length > 0) {
        issues.push({
          sectionIndex,
          sectionHeading: section.heading,
          field,
          violations,
        });
      }
    }

    section.handsOnPractice?.hints?.forEach((hint, hintIndex) => {
      const violations = findLessonPhraseViolations(hint);

      if (violations.length > 0) {
        issues.push({
          sectionIndex,
          sectionHeading: section.heading,
          field: `handsOnPractice.hints[${hintIndex}]`,
          violations,
        });
      }
    });

    section.commonMistakes.forEach((mistake, mistakeIndex) => {
      const violations = findLessonPhraseViolations(mistake);

      if (violations.length > 0) {
        issues.push({
          sectionIndex,
          sectionHeading: section.heading,
          field: `commonMistakes[${mistakeIndex}]`,
          violations,
        });
      }
    });

    section.summary.forEach((takeaway, takeawayIndex) => {
      const violations = findLessonPhraseViolations(takeaway);

      if (violations.length > 0) {
        issues.push({
          sectionIndex,
          sectionHeading: section.heading,
          field: `summary[${takeawayIndex}]`,
          violations,
        });
      }
    });

    section.knowledgeCheck.forEach((check, checkIndex) => {
      const checkText = [check.question, ...check.options, check.explanation].join(" ");
      const violations = findLessonPhraseViolations(checkText);

      if (violations.length > 0) {
        issues.push({
          sectionIndex,
          sectionHeading: section.heading,
          field: `knowledgeCheck[${checkIndex}]`,
          violations,
        });
      }
    });
  });

  return issues;
}

export function containsGenericLessonPhrases(text: string): boolean {
  return GENERIC_LESSON_PHRASES.some((pattern) => pattern.test(text));
}

export function containsLessonMetaLanguage(text: string): boolean {
  return LESSON_META_LANGUAGE_PATTERNS.some((pattern) => pattern.test(text));
}

const OBJECTIVE_ECHO_PATTERNS: RegExp[] = [
  /\bapply\b.+\bin a concrete worked example\b/i,
  /\bexplain (?:key ideas|core mechanics)\b.+/i,
  /\bfoundations workflow\b/i,
  /\bexplain key ideas in\b/i,
];

function significantObjectivePhrases(objectives: string[]): string[] {
  return [...new Set(objectives.map((objective) => objective.trim().toLowerCase()).filter((phrase) => phrase.length >= 16))];
}

function splitLessonParagraphs(lesson: AiLessonResponse): string[] {
  const chunks: string[] = [];

  for (const section of lesson.sections) {
    chunks.push(
      ...section.content
        .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/)
        .map((part) => part.trim())
        .filter((part) => part.length >= 40),
    );

    if (section.practicalExample.trim().length >= 40) {
      chunks.push(section.practicalExample.trim());
    }

    for (const item of [...section.summary, ...section.commonMistakes]) {
      if (item.trim().length >= 24) {
        chunks.push(item.trim());
      }
    }
  }

  return chunks;
}

function paragraphEchoesObjective(paragraph: string, phrases: string[]): boolean {
  const lower = paragraph.toLowerCase();

  if (OBJECTIVE_ECHO_PATTERNS.some((pattern) => pattern.test(paragraph))) {
    return true;
  }

  return phrases.some((phrase) => lower.includes(phrase));
}

/**
 * Reject lessons that treat learning objectives as the lesson body.
 * Objectives may exist as metadata; they must not dominate prose or headings.
 */
export function findObjectiveEchoViolation(
  lesson: AiLessonResponse,
  objectives: string[] | undefined,
): string | null {
  const phrases = significantObjectivePhrases(objectives ?? []);

  for (const section of lesson.sections) {
    const heading = section.heading.trim().toLowerCase();
    for (const phrase of phrases) {
      if (heading === phrase || (phrase.length >= 24 && heading.includes(phrase))) {
        return "Learning objective text must not be copied into section headings; teach topic concepts instead.";
      }
    }
    if (OBJECTIVE_ECHO_PATTERNS.some((pattern) => pattern.test(section.heading))) {
      return "Learning objective text must not be copied into section headings; teach topic concepts instead.";
    }
  }

  const paragraphs = splitLessonParagraphs(lesson);
  if (paragraphs.length === 0) {
    return null;
  }

  const echoCount = paragraphs.filter((paragraph) => paragraphEchoesObjective(paragraph, phrases)).length;
  const echoRatio = echoCount / paragraphs.length;

  if (echoRatio > 0.25) {
    return "More than 25% of paragraphs repeat learning-objective wording; teach the topic itself instead of echoing objectives.";
  }

  const body = lesson.sections
    .map((section) => [section.content, section.practicalExample, ...section.summary, ...section.commonMistakes].join(" "))
    .join("\n");

  const patternHits = OBJECTIVE_ECHO_PATTERNS.reduce(
    (total, pattern) => total + (body.match(new RegExp(pattern.source, "gi"))?.length ?? 0),
    0,
  );
  const phraseHits = phrases.reduce(
    (total, phrase) => total + (body.toLowerCase().split(phrase).length - 1),
    0,
  );

  if (patternHits + phraseHits >= 4) {
    return "Learning-objective phrases dominate the lesson body; expand the topic title into technical concepts instead.";
  }

  return null;
}

export function validateAiLessonStructure(
  parsed: AiLessonResponse,
  context: LessonValidationContext,
): string | null {
  const wordCount = estimateWordCount(parsed);

  if (wordCount > MAX_WORDS_ESTIMATE) {
    return `Lesson exceeds ${MAX_WORDS_ESTIMATE} words (${wordCount}).`;
  }

  const knowledgeCheckCount = parsed.sections.reduce(
    (total, section) => total + section.knowledgeCheck.length,
    0,
  );

  if (knowledgeCheckCount !== REQUIRED_LESSON_KNOWLEDGE_CHECKS) {
    return `Lesson must include exactly ${REQUIRED_LESSON_KNOWLEDGE_CHECKS} knowledge checks (${knowledgeCheckCount} found).`;
  }

  const structureError = validateContentForGoalCategory(
    JSON.stringify(parsed),
    context.goalCategory,
    context.goalSlug,
  );

  if (structureError) {
    return structureError;
  }

  const objectiveEchoError = findObjectiveEchoViolation(
    parsed,
    context.learningObjectives ?? parsed.learningObjectives,
  );

  if (objectiveEchoError) {
    return objectiveEchoError;
  }

  const practicalError = validateLessonPracticalBlocks(parsed, {
    goalCategory: context.goalCategory,
    topicTitle: context.topicTitle,
    topicId: context.topicId,
    learningObjectives: context.learningObjectives ?? parsed.learningObjectives,
  });

  if (practicalError) {
    return practicalError;
  }

  for (const section of parsed.sections) {
    const sectionText = [
      section.heading,
      section.content,
      section.practicalExample,
      section.handsOnPractice?.exercise,
      section.handsOnPractice?.instructions,
      section.handsOnPractice?.solutionExplanation,
      ...section.commonMistakes,
      ...section.summary,
    ]
      .filter(Boolean)
      .join(" ");

    if (section.heading === HANDS_ON_PRACTICE_HEADING && !section.handsOnPractice) {
      return "Hands-on Practice section must include a handsOnPractice object.";
    }

    if (section.handsOnPractice && section.heading !== HANDS_ON_PRACTICE_HEADING) {
      return "handsOnPractice is only allowed on the Hands-on Practice section.";
    }

    if (containsGenericLessonPhrases(sectionText)) {
      return "Lesson sections contain generic placeholder phrasing; regenerate with topic-specific instructor content.";
    }

    if (containsLessonMetaLanguage(sectionText)) {
      return "Lesson sections contain instructional meta language; teach the technical topic directly instead.";
    }

    if (section.commonMistakes.length < 3 || section.commonMistakes.length > 5) {
      return "Each section must include 3 to 5 common mistakes or misconceptions.";
    }

    if (section.summary.length < 3 || section.summary.length > 5) {
      return "Each section must include 3 to 5 key takeaways in summary.";
    }

    if (section.content.trim().length < 80) {
      return "Each section must include substantive instructional content, not filler.";
    }
  }

  return null;
}

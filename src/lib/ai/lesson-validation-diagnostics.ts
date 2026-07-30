import type { AiLessonResponse, LessonSection } from "@/lib/ai/lesson-schema";
import {
  GENERIC_LESSON_PHRASES,
  LESSON_META_LANGUAGE_PATTERNS,
} from "@/lib/ai/lesson-schema";

export type LessonValidationRule = "generic-phrase" | "meta-language";

export interface LessonValidationIssue {
  sectionIndex: number;
  sectionHeading: string;
  rule: LessonValidationRule;
  matchedPattern?: string;
  offendingText: string;
}

interface SectionTextField {
  label: string;
  text: string;
}

function sectionTextFields(section: LessonSection): SectionTextField[] {
  const fields: SectionTextField[] = [
    { label: "heading", text: section.heading },
    { label: "content", text: section.content },
    { label: "practicalExample", text: section.practicalExample },
  ];

  if (section.handsOnPractice) {
    fields.push(
      { label: "handsOnPractice.exercise", text: section.handsOnPractice.exercise },
      { label: "handsOnPractice.instructions", text: section.handsOnPractice.instructions },
      { label: "handsOnPractice.thinkAbout", text: section.handsOnPractice.thinkAbout },
      {
        label: "handsOnPractice.expectedOutcome",
        text: section.handsOnPractice.expectedOutcome,
      },
      {
        label: "handsOnPractice.solutionExplanation",
        text: section.handsOnPractice.solutionExplanation,
      },
    );

    for (const [index, hint] of (section.handsOnPractice.hints ?? []).entries()) {
      fields.push({ label: `handsOnPractice.hints[${index}]`, text: hint });
    }
  }

  for (const [index, mistake] of section.commonMistakes.entries()) {
    fields.push({ label: `commonMistakes[${index}]`, text: mistake });
  }

  for (const [index, summaryItem] of section.summary.entries()) {
    fields.push({ label: `summary[${index}]`, text: summaryItem });
  }

  for (const [index, check] of section.knowledgeCheck.entries()) {
    fields.push(
      { label: `knowledgeCheck[${index}].question`, text: check.question },
      { label: `knowledgeCheck[${index}].explanation`, text: check.explanation },
    );

    for (const [optionIndex, option] of check.options.entries()) {
      fields.push({
        label: `knowledgeCheck[${index}].options[${optionIndex}]`,
        text: option,
      });
    }
  }

  return fields.filter((field) => field.text.trim().length > 0);
}

function findPatternIssuesInText(
  text: string,
  patterns: RegExp[],
  rule: LessonValidationRule,
  sectionIndex: number,
  sectionHeading: string,
  fieldLabel: string,
): LessonValidationIssue[] {
  const issues: LessonValidationIssue[] = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    issues.push({
      sectionIndex,
      sectionHeading,
      rule,
      matchedPattern: pattern.source,
      offendingText: `${fieldLabel}: ${match[0]}`,
    });
  }

  return issues;
}

export function findGenericPhraseIssuesInSection(
  section: LessonSection,
  sectionIndex: number,
): LessonValidationIssue[] {
  return sectionTextFields(section).flatMap((field) =>
    findPatternIssuesInText(
      field.text,
      GENERIC_LESSON_PHRASES,
      "generic-phrase",
      sectionIndex,
      section.heading,
      field.label,
    ),
  );
}

export function findMetaLanguageIssuesInSection(
  section: LessonSection,
  sectionIndex: number,
): LessonValidationIssue[] {
  return sectionTextFields(section).flatMap((field) =>
    findPatternIssuesInText(
      field.text,
      LESSON_META_LANGUAGE_PATTERNS,
      "meta-language",
      sectionIndex,
      section.heading,
      field.label,
    ),
  );
}

export function findLessonValidationIssues(lesson: AiLessonResponse): LessonValidationIssue[] {
  return lesson.sections.flatMap((section, sectionIndex) => [
    ...findGenericPhraseIssuesInSection(section, sectionIndex),
    ...findMetaLanguageIssuesInSection(section, sectionIndex),
  ]);
}

export function lessonHasValidationIssues(lesson: AiLessonResponse): boolean {
  return findLessonValidationIssues(lesson).length > 0;
}

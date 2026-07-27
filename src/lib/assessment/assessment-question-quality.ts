import type { AssessmentQuestion } from "@/lib/assessment/assessment-schema";

const GENERIC_STUDY_ADVICE_PATTERNS = [
  /best (way|first step) to study/i,
  /best first step when learning/i,
  /how should .* connect to your learning plan/i,
  /connect to your learning plan/i,
  /what is the best next step/i,
  /why does this topic matter/i,
  /unrelated background reading/i,
  /memorize every detail without context/i,
  /avoid checking understanding/i,
  /never require understanding/i,
  /can be ignored/i,
  /never require understanding/i,
  /goals never require/i,
];

export function isGenericStudyAdviceQuestion(prompt: string): boolean {
  return GENERIC_STUDY_ADVICE_PATTERNS.some((pattern) => pattern.test(prompt));
}

export function selectDiverseAssessmentQuestions(
  questions: AssessmentQuestion[],
  count: number,
): AssessmentQuestion[] {
  const selected: AssessmentQuestion[] = [];
  const usedConceptTags = new Set<string>();
  const usedPrompts = new Set<string>();

  for (const question of questions) {
    if (selected.length >= count) {
      break;
    }

    const promptKey = question.prompt.trim().toLowerCase();
    if (usedPrompts.has(promptKey)) {
      continue;
    }

    if (usedConceptTags.has(question.conceptTag) && selected.length >= Math.floor(count / 2)) {
      continue;
    }

    selected.push(question);
    usedConceptTags.add(question.conceptTag);
    usedPrompts.add(promptKey);
  }

  for (const question of questions) {
    if (selected.length >= count) {
      break;
    }

    if (selected.some((entry) => entry.id === question.id)) {
      continue;
    }

    selected.push(question);
  }

  return selected.slice(0, count);
}

export function filterValidLessonQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  return questions.filter((question) => !isGenericStudyAdviceQuestion(question.prompt));
}

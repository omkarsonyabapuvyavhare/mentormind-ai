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
  /goals never require/i,
];

const GENERIC_META_QUESTION_PATTERNS = [
  /which statement best reflects/i,
  /explain key ideas in/i,
  /lesson overview/i,
  /overview statement about/i,
  /your learning goal/i,
  /your roadmap/i,
  /topic check-in/i,
  /unrelated concept from another topic/i,
  /using the wrong syntax for .+ in this context/i,
  /applying an operator that does not match/i,
];

const GENERIC_DISTRACTOR_PATTERNS = [
  /^using the wrong syntax for /i,
  /^confusing .+ with an unrelated concept from another topic$/i,
  /^applying an operator that does not match/i,
  /^incorrect alternative \d+ for this concept$/i,
];

export function normalizeQuestionStem(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(the|a|an|in|for|of|to|and|or)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isGenericStudyAdviceQuestion(prompt: string): boolean {
  return GENERIC_STUDY_ADVICE_PATTERNS.some((pattern) => pattern.test(prompt));
}

export function isGenericMetaAssessmentQuestion(prompt: string): boolean {
  return GENERIC_META_QUESTION_PATTERNS.some((pattern) => pattern.test(prompt));
}

export function hasGenericDistractors(options: string[]): boolean {
  const genericCount = options.filter((option) =>
    GENERIC_DISTRACTOR_PATTERNS.some((pattern) => pattern.test(option)),
  ).length;
  return genericCount >= 2;
}

function stripTopicNameTokens(stem: string): string {
  return stem
    .replace(/\b(query basics|python|java|kubernetes|azure|sql|basics|syntax|data types)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stemsAreNearDuplicates(left: string, right: string): boolean {
  const a = normalizeQuestionStem(left);
  const b = normalizeQuestionStem(right);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  // Topic-name substitution: same skeleton after removing likely topic labels.
  const aStripped = stripTopicNameTokens(a);
  const bStripped = stripTopicNameTokens(b);
  if (aStripped.length >= 28 && aStripped === bStripped) {
    return true;
  }

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;

  if (shorter.length >= 36 && longer.includes(shorter)) {
    return true;
  }

  // Only treat high token overlap as duplication when stems are nearly the same length
  // and differ by at most one content token (typical copy/paste with a swapped noun).
  const leftTokens = a.split(" ").filter((token) => token.length > 2);
  const rightTokens = b.split(" ").filter((token) => token.length > 2);
  if (leftTokens.length < 6 || rightTokens.length < 6) {
    return false;
  }

  if (Math.abs(leftTokens.length - rightTokens.length) > 1) {
    return false;
  }

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  let overlap = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      overlap += 1;
    }
  }

  const union = new Set([...leftSet, ...rightSet]).size;
  const jaccard = overlap / union;
  return jaccard >= 0.92;
}

export function filterValidLessonQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  return questions.filter(
    (question) =>
      !isGenericStudyAdviceQuestion(question.prompt) &&
      !isGenericMetaAssessmentQuestion(question.prompt) &&
      !hasGenericDistractors(question.options),
  );
}

export function selectDiverseAssessmentQuestions(
  questions: AssessmentQuestion[],
  count: number,
): AssessmentQuestion[] {
  const selected: AssessmentQuestion[] = [];
  const usedConceptTags = new Set<string>();
  const usedPrompts: string[] = [];
  const usedCorrectAnswers = new Set<string>();

  for (const question of questions) {
    if (selected.length >= count) {
      break;
    }

    if (usedPrompts.some((existing) => stemsAreNearDuplicates(existing, question.prompt))) {
      continue;
    }

    if (usedConceptTags.has(question.conceptTag)) {
      continue;
    }

    const correct = question.options[question.correctIndex]?.trim().toLowerCase() ?? "";
    if (correct && usedCorrectAnswers.has(correct)) {
      continue;
    }

    selected.push(question);
    usedConceptTags.add(question.conceptTag);
    usedPrompts.push(question.prompt);
    if (correct) {
      usedCorrectAnswers.add(correct);
    }
  }

  // Second pass: allow new concept tags only; still reject near-duplicate stems.
  for (const question of questions) {
    if (selected.length >= count) {
      break;
    }

    if (selected.some((entry) => entry.id === question.id)) {
      continue;
    }

    if (usedPrompts.some((existing) => stemsAreNearDuplicates(existing, question.prompt))) {
      continue;
    }

    if (usedConceptTags.has(question.conceptTag) && selected.length >= Math.ceil(count * 0.8)) {
      continue;
    }

    selected.push(question);
    usedConceptTags.add(question.conceptTag);
    usedPrompts.push(question.prompt);
  }

  return selected.slice(0, count);
}

export function countDistinctConcepts(questions: AssessmentQuestion[]): number {
  return new Set(questions.map((question) => question.conceptTag)).size;
}

export function validateAssessmentQuestionQuality(
  questions: AssessmentQuestion[],
): string | null {
  if (questions.length !== 5) {
    return `Assessment must contain exactly 5 questions (${questions.length} found).`;
  }

  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i]!;

    if (isGenericStudyAdviceQuestion(question.prompt) || isGenericMetaAssessmentQuestion(question.prompt)) {
      return "Assessment contains generic meta-language or study-advice questions.";
    }

    if (hasGenericDistractors(question.options)) {
      return "Assessment contains generic placeholder distractors.";
    }

    for (let j = i + 1; j < questions.length; j += 1) {
      if (stemsAreNearDuplicates(question.prompt, questions[j]!.prompt)) {
        return "Assessment contains duplicate or near-duplicate question stems.";
      }
    }
  }

  if (countDistinctConcepts(questions) < 4) {
    return "Assessment must test at least 4 distinct concepts.";
  }

  const allSameTag = questions.every((question) => question.conceptTag === questions[0]?.conceptTag);
  if (allSameTag) {
    return "Assessment concept tags must not be identical across all questions.";
  }

  return null;
}

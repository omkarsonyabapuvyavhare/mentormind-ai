import type { AssessmentQuestion } from "@/lib/assessment/assessment-schema";

export interface ConceptScoreResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  passed: boolean;
  mastery: boolean;
  masteredConceptTags: string[];
  weakConceptTags: string[];
  incorrectQuestions: AssessmentQuestion[];
}

export function scoreAssessmentByConcept(
  questions: AssessmentQuestion[],
  selectedAnswers: Record<string, number>,
  passingScore: number,
  masteryScore: number,
): ConceptScoreResult {
  let correctCount = 0;
  const conceptResults = new Map<string, { correct: number; total: number }>();
  const incorrectQuestions: AssessmentQuestion[] = [];

  for (const question of questions) {
    const isCorrect = selectedAnswers[question.id] === question.correctIndex;

    if (isCorrect) {
      correctCount += 1;
    } else {
      incorrectQuestions.push(question);
    }

    const current = conceptResults.get(question.conceptTag) ?? { correct: 0, total: 0 };
    conceptResults.set(question.conceptTag, {
      correct: current.correct + (isCorrect ? 1 : 0),
      total: current.total + 1,
    });
  }

  const totalQuestions = questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const masteredConceptTags: string[] = [];
  const weakConceptTags: string[] = [];

  for (const [conceptTag, result] of conceptResults.entries()) {
    if (result.correct === result.total) {
      masteredConceptTags.push(conceptTag);
      continue;
    }

    weakConceptTags.push(conceptTag);
  }

  return {
    score,
    correctCount,
    incorrectCount,
    totalQuestions,
    passed: score >= passingScore,
    mastery: score >= masteryScore,
    masteredConceptTags,
    weakConceptTags,
    incorrectQuestions,
  };
}

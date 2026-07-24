import type { QuizQuestion } from "@/data/aws-saa-seed";

export interface QuizScoreResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  passed: boolean;
  mastery: boolean;
}

export function calculateQuizScore(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>,
  passingScore: number,
  masteryScore: number,
): QuizScoreResult {
  let correctCount = 0;

  for (const question of questions) {
    if (selectedAnswers[question.id] === question.correctIndex) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  return {
    score,
    correctCount,
    incorrectCount,
    totalQuestions,
    passed: score >= passingScore,
    mastery: score >= masteryScore,
  };
}

/** Builds selected answers that produce a target score deterministically. */
export function buildAnswersForTargetScore(
  questions: QuizQuestion[],
  targetScore: number,
): Record<string, number> {
  const targetCorrect = Math.round((targetScore / 100) * questions.length);
  const answers: Record<string, number> = {};

  questions.forEach((question, index) => {
    if (index < targetCorrect) {
      answers[question.id] = question.correctIndex;
      return;
    }

    const wrongIndex = question.correctIndex === 0 ? 1 : 0;
    answers[question.id] = wrongIndex;
  });

  return answers;
}

export function validateAllQuestionsAnswered(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>,
): boolean {
  return questions.every((question) => selectedAnswers[question.id] !== undefined);
}

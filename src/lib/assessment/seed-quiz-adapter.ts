import type { TopicQuiz } from "@/data/aws-saa-seed";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";

export function topicQuizToAssessment(quiz: TopicQuiz): TopicAssessment {
  return {
    topicId: quiz.topicId,
    passingScore: quiz.passingScore,
    source: "seed",
    questions: quiz.questions.map((question, index) => ({
      id: question.id,
      topicId: quiz.topicId,
      conceptTag: `seed-concept-${index + 1}`,
      prompt: question.prompt,
      options: [
        question.options[0] ?? "Option A",
        question.options[1] ?? "Option B",
        question.options[2] ?? "Option C",
        question.options[3] ?? "Option D",
      ],
      correctIndex: question.correctIndex,
      explanation: "Review the lesson and VPC networking fundamentals for this topic.",
    })),
  };
}

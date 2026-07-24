"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AiReasoningSummaryCard } from "@/components/shared/ai-reasoning-summary-card";
import { MentorAnalysisOverlay } from "@/components/shared/mentor-analysis-overlay";
import { QuizNavigation } from "@/components/assessment/quiz-navigation";
import { QuizProgress } from "@/components/assessment/quiz-progress";
import { QuizQuestionCard } from "@/components/assessment/quiz-question-card";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { demo } from "@/constants/demo";
import { routes } from "@/constants/routes";
import { theme } from "@/constants/theme";
import { thresholds } from "@/constants/thresholds";
import type { TopicQuiz } from "@/data/aws-saa-seed";
import {
  buildAnswersForTargetScore,
  calculateQuizScore,
  validateAllQuestionsAnswered,
} from "@/lib/assessment/quiz-scoring";
import { selectAssessmentReasoningSummary } from "@/lib/ai/reasoning-summary";
import { useAppStore } from "@/stores/use-app-store";
import type { AdaptationRevealKind } from "@/types/ui-state";
import type { LearnerEventPayload } from "@/types/events";

type QuizPhase = "taking" | "confirming" | "analyzing" | "reasoning";

function resolveRevealKind(score: number): AdaptationRevealKind {
  if (score >= thresholds.masteryScore) {
    return "mastery";
  }

  if (score < thresholds.weakQuizScore) {
    return "weakness";
  }

  return "neutral";
}

export function QuizShell({ quiz }: { quiz: TopicQuiz }) {
  const router = useRouter();
  const dispatchLearnerEvent = useAppStore((state) => state.dispatchLearnerEvent);
  const showAdaptationReveal = useAppStore((state) => state.showAdaptationReveal);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const lastError = useAppStore((state) => state.lastError);

  const storeState = useAppStore();

  const [phase, setPhase] = useState<QuizPhase>("taking");
  const [analysisTitle, setAnalysisTitle] = useState("MentorMind is analyzing your learning...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const hasSubmittedRef = useRef(false);
  const pendingScoreRef = useRef(0);

  const finishAnalysis = useCallback(() => {
    setPhase("reasoning");
  }, []);

  const finishReasoning = useCallback(() => {
    const score = submittedScore ?? pendingScoreRef.current;
    showAdaptationReveal(resolveRevealKind(score), score);
    router.push(routes.mentorFeedback);
  }, [router, showAdaptationReveal, submittedScore]);

  const currentQuestion = quiz.questions[currentIndex];

  const dispatchQuizScore = useCallback(
    (score: number, timestamp: string) => {
      if (hasSubmittedRef.current) {
        setSubmissionError("This assessment was already submitted.");
        return false;
      }

      const event: LearnerEventPayload = {
        type: "QUIZ_COMPLETED",
        topicId: quiz.topicId,
        score,
        totalQuestions: quiz.questions.length,
        timestamp,
      };

      dispatchLearnerEvent(event);
      hasSubmittedRef.current = true;
      pendingScoreRef.current = score;
      setSubmittedScore(score);
      return true;
    },
    [dispatchLearnerEvent, quiz.questions.length, quiz.topicId],
  );

  const handleSubmit = useCallback(
    (answers: Record<string, number>, forcedScore?: number) => {
      if (isSubmitting || hasSubmittedRef.current) {
        setSubmissionError("This assessment was already submitted.");
        return;
      }

      if (!validateAllQuestionsAnswered(quiz.questions, answers) && forcedScore === undefined) {
        setSubmissionError("Please answer every question before submitting.");
        return;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      const result = calculateQuizScore(
        quiz.questions,
        answers,
        quiz.passingScore,
        thresholds.masteryScore,
      );
      const score = forcedScore ?? result.score;
      const timestamp = new Date().toISOString();

      const dispatched = dispatchQuizScore(score, timestamp);
      if (!dispatched) {
        setIsSubmitting(false);
        return;
      }

      setAnalysisTitle(
        score >= thresholds.masteryScore
          ? "MentorMind detected mastery."
          : "MentorMind is analyzing your learning...",
      );
      setPhase("analyzing");
      setIsSubmitting(false);
    },
    [dispatchQuizScore, isSubmitting, quiz.passingScore, quiz.questions],
  );

  const handleConfirmSubmit = () => {
    handleSubmit(selectedAnswers);
  };

  const handleSimulate = (targetScore: number) => {
    const answers = buildAnswersForTargetScore(quiz.questions, targetScore);
    setSelectedAnswers(answers);
    handleSubmit(answers, targetScore);
  };

  if (phase === "reasoning" && submittedScore !== null) {
    const summary = selectAssessmentReasoningSummary(storeState, submittedScore);

    return (
      <AiReasoningSummaryCard
        summary={summary}
        action={
          <Button size="lg" onClick={finishReasoning}>
            Continue to mentor feedback
          </Button>
        }
      />
    );
  }

  if (phase === "analyzing") {
    return (
      <MentorAnalysisOverlay
        title={analysisTitle}
        subtitle="Your Learning Twin and roadmap are updating in real time."
        onComplete={finishAnalysis}
      />
    );
  }

  if (phase === "confirming") {
    return (
      <GlassCard>
        <h2 className="text-xl font-semibold">Ready to submit?</h2>
        <p className="mt-3 text-sm text-muted">
          MentorMind will analyze your results and share personalized feedback next.
        </p>
        {submissionError ? <p className="mt-3 text-sm text-amber-300">{submissionError}</p> : null}
        {lastError ? <p className="mt-3 text-sm text-red-300">{lastError}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
            Submit to my mentor
          </Button>
          <Button variant="secondary" onClick={() => setPhase("taking")} disabled={isSubmitting}>
            Review answers
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <QuizProgress currentIndex={currentIndex} totalQuestions={quiz.questions.length} />

      <QuizQuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        selectedIndex={selectedAnswers[currentQuestion.id]}
        onSelect={(index) =>
          setSelectedAnswers((previous) => ({
            ...previous,
            [currentQuestion.id]: index,
          }))
        }
        disabled={isSubmitting}
      />

      {submissionError ? <p className="text-sm text-amber-300">{submissionError}</p> : null}
      {lastError ? <p className="text-sm text-red-300">{lastError}</p> : null}

      <QuizNavigation
        canGoPrevious={currentIndex > 0}
        canGoNext={selectedAnswers[currentQuestion.id] !== undefined}
        isLastQuestion={currentIndex === quiz.questions.length - 1}
        onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        onNext={() => setCurrentIndex((index) => Math.min(quiz.questions.length - 1, index + 1))}
        onSubmit={() => {
          if (!validateAllQuestionsAnswered(quiz.questions, selectedAnswers)) {
            setSubmissionError("Please answer every question before submitting.");
            return;
          }
          setSubmissionError(null);
          setPhase("confirming");
        }}
        submitDisabled={isSubmitting}
      />

      {isInitialized ? (
        <GlassCard className={theme.cards.warning}>
          <Badge className={theme.badges.demo}>Live demo shortcuts</Badge>
          <p className="mt-3 text-sm text-muted">
            Submit a score instantly — your mentor will respond with feedback and an updated plan.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" disabled={isSubmitting} onClick={() => handleSimulate(demo.weakQuizScore)}>
              Submit 42% result
            </Button>
            <Button variant="secondary" disabled={isSubmitting} onClick={() => handleSimulate(demo.masteryQuizScore)}>
              Submit 95% result
            </Button>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AiReasoningSummaryCard } from "@/components/shared/ai-reasoning-summary-card";
import { AssessmentResultsSummary } from "@/components/assessment/assessment-results-summary";
import { MentorAnalysisOverlay } from "@/components/shared/mentor-analysis-overlay";
import { QuizNavigation } from "@/components/assessment/quiz-navigation";
import { QuizProgress } from "@/components/assessment/quiz-progress";
import { QuizQuestionCard } from "@/components/assessment/quiz-question-card";
import { PresenterControls } from "@/components/presenter/presenter-controls";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { routes } from "@/constants/routes";
import { thresholds } from "@/constants/thresholds";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import {
  validateAllQuestionsAnswered,
} from "@/lib/assessment/quiz-scoring";
import {
  scoreAssessmentByConcept,
  type ConceptScoreResult,
} from "@/lib/assessment/concept-scoring";
import { buildQuizCompletedPayload } from "@/lib/assessment/normalize-quiz-result";
import { selectAssessmentReasoningSummary } from "@/lib/ai/reasoning-summary";
import {
  buildPresenterQuizResult,
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import { useAppStore } from "@/stores/use-app-store";
import type { AdaptationRevealKind } from "@/types/ui-state";

type QuizPhase = "taking" | "confirming" | "results" | "analyzing" | "reasoning";

function resolveRevealKind(score: number): AdaptationRevealKind {
  if (score >= thresholds.masteryScore) {
    return "mastery";
  }

  if (score < thresholds.weakQuizScore) {
    return "weakness";
  }

  return "neutral";
}

export function QuizShell({ assessment }: { assessment: TopicAssessment }) {
  const router = useRouter();
  const dispatchLearnerEvent = useAppStore((state) => state.dispatchLearnerEvent);
  const showAdaptationReveal = useAppStore((state) => state.showAdaptationReveal);
  const presenterMode = useAppStore((state) => state.presenterMode);
  const envPresenterMode = process.env.NEXT_PUBLIC_PRESENTER_MODE === "true";
  const showInlinePresenterControls = envPresenterMode || presenterMode;
  const lastError = useAppStore((state) => state.lastError);

  const storeState = useAppStore();

  const [phase, setPhase] = useState<QuizPhase>("taking");
  const [analysisTitle, setAnalysisTitle] = useState("MentorMind is analyzing your learning...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [scoreResult, setScoreResult] = useState<ConceptScoreResult | null>(null);
  const hasSubmittedRef = useRef(false);
  const pendingScoreRef = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || phase !== "taking") {
      return;
    }

    console.info("[QuizShell]", {
      shouldRenderPresenterControls: showInlinePresenterControls,
      hasAssessment: Boolean(assessment),
      phase,
      questionCount: assessment.questions.length,
    });
  }, [assessment, phase, showInlinePresenterControls]);

  const finishAnalysis = useCallback(() => {
    setPhase("reasoning");
  }, []);

  const finishReasoning = useCallback(() => {
    const score = submittedScore ?? pendingScoreRef.current;
    showAdaptationReveal(resolveRevealKind(score), score);
    router.push(routes.mentorFeedback);
  }, [router, showAdaptationReveal, submittedScore]);

  const currentQuestion = assessment.questions[currentIndex];

  const dispatchQuizScore = useCallback(
    (result: ConceptScoreResult, timestamp: string) => {
      if (hasSubmittedRef.current) {
        setSubmissionError("This assessment was already submitted.");
        return false;
      }

      const event = buildQuizCompletedPayload(assessment, result, timestamp);
      dispatchLearnerEvent(event);
      hasSubmittedRef.current = true;
      pendingScoreRef.current = result.score;
      setSubmittedScore(result.score);
      setScoreResult(result);
      return true;
    },
    [assessment, dispatchLearnerEvent],
  );

  const handleSubmit = useCallback(
    (answers: Record<string, number>, forcedScore?: number) => {
      if (isSubmitting || hasSubmittedRef.current) {
        setSubmissionError("This assessment was already submitted.");
        return;
      }

      if (!validateAllQuestionsAnswered(assessment.questions, answers) && forcedScore === undefined) {
        setSubmissionError("Please answer every question before submitting.");
        return;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      let result = scoreAssessmentByConcept(
        assessment.questions,
        answers,
        assessment.passingScore,
        thresholds.masteryScore,
      );

      if (forcedScore !== undefined) {
        result = {
          ...result,
          score: forcedScore,
          passed: forcedScore >= assessment.passingScore,
          mastery: forcedScore >= thresholds.masteryScore,
        };
      }

      const timestamp = new Date().toISOString();
      const dispatched = dispatchQuizScore(result, timestamp);

      if (!dispatched) {
        setIsSubmitting(false);
        return;
      }

      setAnalysisTitle(
        result.score >= thresholds.masteryScore
          ? "MentorMind detected mastery."
          : "MentorMind is analyzing your learning...",
      );
      setPhase("results");
      setIsSubmitting(false);
    },
    [assessment.passingScore, assessment.questions, dispatchQuizScore, isSubmitting],
  );

  const handleConfirmSubmit = () => {
    handleSubmit(selectedAnswers);
  };

  const handlePresenterSimulate = useCallback(
    (targetScore: number) => {
      if (isSubmitting || hasSubmittedRef.current) {
        setSubmissionError("This assessment was already submitted.");
        return;
      }

      setSubmissionError(null);
      setIsSubmitting(true);

      const result = buildPresenterQuizResult(assessment, targetScore);
      const timestamp = new Date().toISOString();
      const dispatched = dispatchQuizScore(result, timestamp);

      if (!dispatched) {
        setIsSubmitting(false);
        return;
      }

      setAnalysisTitle(
        targetScore >= thresholds.masteryScore
          ? "MentorMind detected mastery."
          : "MentorMind is analyzing your learning...",
      );
      setPhase("analyzing");
      setIsSubmitting(false);
    },
    [assessment, dispatchQuizScore, isSubmitting],
  );

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

  if (phase === "results" && scoreResult) {
    return (
      <AssessmentResultsSummary
        result={scoreResult}
        onContinue={() => setPhase("analyzing")}
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
      <QuizProgress currentIndex={currentIndex} totalQuestions={assessment.questions.length} />

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
        isLastQuestion={currentIndex === assessment.questions.length - 1}
        onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        onNext={() => setCurrentIndex((index) => Math.min(assessment.questions.length - 1, index + 1))}
        onSubmit={() => {
          if (!validateAllQuestionsAnswered(assessment.questions, selectedAnswers)) {
            setSubmissionError("Please answer every question before submitting.");
            return;
          }
          setSubmissionError(null);
          setPhase("confirming");
        }}
        submitDisabled={isSubmitting}
      />

      <PresenterControls
        variant="assessment"
        layout="inline"
        assessment={assessment}
        disabled={isSubmitting}
        handlers={{
          onSimulateWeak: () => handlePresenterSimulate(PRESENTER_WEAK_SCORE),
          onSimulateMastery: () => handlePresenterSimulate(PRESENTER_MASTERY_SCORE),
        }}
      />
    </div>
  );
}

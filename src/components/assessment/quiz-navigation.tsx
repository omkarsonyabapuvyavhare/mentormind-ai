"use client";

import { Button } from "@/components/ui/button";

export function QuizNavigation({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
  submitDisabled,
}: {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button onClick={onPrevious} disabled={!canGoPrevious}>
        Previous
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row">
        {isLastQuestion ? (
          <Button onClick={onSubmit} disabled={submitDisabled}>
            Review & Submit
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canGoNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { ProgressBar } from "@/components/ui/progress";

export function QuizProgress({
  currentIndex,
  totalQuestions,
}: {
  currentIndex: number;
  totalQuestions: number;
}) {
  const percent = totalQuestions === 0 ? 0 : Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Question progress</span>
        <span className="font-medium">
          {currentIndex + 1} of {totalQuestions}
        </span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}

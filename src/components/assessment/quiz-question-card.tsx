"use client";

import { GlassCard } from "@/components/ui/glass-card";
import type { AssessmentQuestion } from "@/lib/assessment/assessment-schema";

import { AnswerOption } from "./answer-option";

export function QuizQuestionCard({
  question,
  questionNumber,
  selectedIndex,
  onSelect,
  disabled,
}: {
  question: AssessmentQuestion;
  questionNumber: number;
  selectedIndex?: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <GlassCard>
      <p className="text-sm uppercase tracking-wide text-muted">Question {questionNumber}</p>
      <h3 className="mt-3 text-lg font-medium md:text-xl">{question.prompt}</h3>
      <div
        className="mt-6 space-y-3"
        role="radiogroup"
        aria-label={`Question ${questionNumber}`}
      >
        {question.options.map((option, index) => (
          <AnswerOption
            key={`${question.id}-${index}`}
            label={option}
            selected={selectedIndex === index}
            onSelect={() => onSelect(index)}
            disabled={disabled}
          />
        ))}
      </div>
    </GlassCard>
  );
}

"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import type { ConceptScoreResult } from "@/lib/assessment/concept-scoring";

export function AssessmentResultsSummary({
  result,
  onContinue,
}: {
  result: ConceptScoreResult;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Check your understanding</p>
        <h2 className="mt-3 text-2xl font-semibold">Your score: {result.score}%</h2>
        <p className="mt-2 text-sm text-muted">
          {result.correctCount} correct · {result.incorrectCount} incorrect ·{" "}
          {result.totalQuestions} questions
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className={result.passed ? theme.badges.success : theme.badges.warning}>
            {result.passed ? "Passed" : "Needs review"}
          </Badge>
          {result.mastery ? (
            <Badge className={theme.badges.success}>Mastery level</Badge>
          ) : null}
        </div>
      </GlassCard>

      {result.masteredConceptTags.length > 0 ? (
        <GlassCard className={theme.cards.success}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Concepts mastered
          </div>
          <ul className="mt-3 space-y-2">
            {result.masteredConceptTags.map((concept) => (
              <li key={concept} className="text-sm text-muted">
                {formatConceptLabel(concept)}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      {result.weakConceptTags.length > 0 ? (
        <GlassCard className={theme.cards.warning}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200">
            <RotateCcw className="h-4 w-4" />
            Concepts to revisit
          </div>
          <ul className="mt-3 space-y-2">
            {result.weakConceptTags.map((concept) => (
              <li key={concept} className="text-sm text-muted">
                {formatConceptLabel(concept)}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      {result.incorrectQuestions.length > 0 ? (
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Review incorrect answers</p>
          <div className="mt-4 space-y-4">
            {result.incorrectQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium">{question.prompt}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{question.explanation}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <Button size="lg" onClick={onContinue}>
        Continue to mentor analysis
      </Button>
    </div>
  );
}

function formatConceptLabel(conceptTag: string): string {
  return conceptTag
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

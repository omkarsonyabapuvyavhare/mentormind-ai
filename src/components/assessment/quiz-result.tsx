"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { QuizScoreResult } from "@/lib/assessment/quiz-scoring";
import type { SessionAction } from "@/lib/demo/session-actions";

export function QuizResult({
  topicName,
  result,
  interpretation,
  primaryAction,
  secondaryActions = [],
  children,
}: {
  topicName: string;
  result: QuizScoreResult;
  interpretation: string;
  primaryAction: SessionAction;
  secondaryActions?: SessionAction[];
  children?: React.ReactNode;
}) {
  const passed = result.passed;
  const mastery = result.mastery;

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center gap-3">
        {mastery ? (
          <Trophy className="h-6 w-6 text-emerald-300" />
        ) : passed ? (
          <CheckCircle2 className="h-6 w-6 text-cyan-300" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-amber-300" />
        )}
        <div>
          <h2 className="text-2xl font-semibold">{topicName} Assessment Result</h2>
          <p className="mt-1 text-sm text-muted">{interpretation}</p>
        </div>
        <Badge
          className={
            mastery
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : passed
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                : "border-amber-400/20 bg-amber-400/10 text-amber-200"
          }
        >
          {mastery ? "Mastery" : passed ? "Passed" : "Below passing threshold"}
        </Badge>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Score</dt>
          <dd className="mt-2 text-3xl font-semibold">{result.score}%</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Correct</dt>
          <dd className="mt-2 text-3xl font-semibold">{result.correctCount}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Incorrect</dt>
          <dd className="mt-2 text-3xl font-semibold">{result.incorrectCount}</dd>
        </div>
      </dl>

      {children}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild>
          <Link href={primaryAction.href}>{primaryAction.label}</Link>
        </Button>
        {secondaryActions.map((action) => (
          <Button key={`${action.href}-${action.label}`} asChild variant="secondary">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </GlassCard>
  );
}

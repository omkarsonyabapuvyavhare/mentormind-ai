"use client";

import Link from "next/link";
import { Clock3, HelpCircle, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { AssessmentCatalogEntry } from "@/constants/assessment-catalog";

type AssessmentTopic = AssessmentCatalogEntry;

export function AssessmentOverviewCard({
  topic,
  attemptCount,
  topicStatus,
}: {
  topic: AssessmentTopic;
  attemptCount: number;
  topicStatus: "ready" | "weakness" | "mastery";
}) {
  const statusLabel =
    topicStatus === "mastery"
      ? "Mastery achieved"
      : topicStatus === "weakness"
        ? "Needs remediation"
        : "Ready to assess";

  const statusClass =
    topicStatus === "mastery"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : topicStatus === "weakness"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";

  return (
    <GlassCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className={statusClass}>{statusLabel}</Badge>
          <h3 className="mt-4 text-xl font-semibold">{topic.title}</h3>
          <p className="mt-3 text-sm text-muted">{topic.description}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <HelpCircle className="h-4 w-4" />
            Questions
          </dt>
          <dd className="mt-2 text-lg font-semibold">{topic.questionCount}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <Target className="h-4 w-4" />
            Passing score
          </dt>
          <dd className="mt-2 text-lg font-semibold">{topic.passingScore}%</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <Clock3 className="h-4 w-4" />
            Estimated time
          </dt>
          <dd className="mt-2 text-lg font-semibold">{topic.estimatedMinutes} min</dd>
        </div>
      </dl>

      <p className="mt-5 text-sm text-muted">
        Previous attempts: {attemptCount}
      </p>

      <div className="mt-auto pt-6">
        {topic.available ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={topic.href}>Take this quiz</Link>
          </Button>
        ) : (
          <Button disabled className="w-full sm:w-auto">
            Coming soon
          </Button>
        )}
      </div>
    </GlassCard>
  );
}

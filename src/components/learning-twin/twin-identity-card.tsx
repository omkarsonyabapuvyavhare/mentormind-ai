"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { LearningTwin } from "@/types/learning-twin";

export function TwinIdentityCard({ twin }: { twin: LearningTwin }) {
  return (
    <GlassCard>
      <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200 capitalize">
        {twin.skillLevel}
      </Badge>
      <h2 className="mt-4 text-2xl font-semibold">{twin.goal.title}</h2>
      <p className="mt-3 text-sm text-muted">
        Target date {format(new Date(twin.goal.targetDate), "PPP")}
        {twin.goal.examCode ? ` · ${twin.goal.examCode}` : ""}
      </p>
      <p className="mt-4 text-sm leading-7 text-muted">
        The Learning Twin is a continuously evolving learner memory. Every quiz, completed task,
        missed session, and study pattern updates future decisions.
      </p>
    </GlassCard>
  );
}

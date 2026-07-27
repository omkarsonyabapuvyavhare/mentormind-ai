"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ONBOARDING_SUMMARY_READY_LINE } from "@/lib/onboarding/goal-intent-constants";
import {
  goalTypeDisplayLabel,
  type OnboardingDraft,
} from "@/lib/onboarding/onboarding-draft";
import { categoryLabel } from "@/lib/onboarding/map-parsed-intent";

const formatLabels: Record<string, string> = {
  video: "Video",
  reading: "Reading",
  lab: "Hands-on practice",
  quiz: "Quizzes",
};

export function OnboardingSummary({
  draft,
  challengeLabels,
  onEditStep,
}: {
  draft: OnboardingDraft;
  challengeLabels: string[];
  onEditStep: (step: number) => void;
}) {
  return (
    <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
      <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
        {goalTypeDisplayLabel(draft.goalType)}
      </Badge>
      <h2 className="mt-4 text-xl font-semibold">Review your learning plan inputs</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{ONBOARDING_SUMMARY_READY_LINE}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Goal" value={draft.goalTitle} onEdit={() => onEditStep(0)} />
        <SummaryItem label="Category" value={categoryLabel(draft.goalCategory)} onEdit={() => onEditStep(0)} />
        <SummaryItem
          label="Goal type"
          value={draft.goalType === "Certification" ? "Certification" : "Skill"}
          onEdit={() => onEditStep(0)}
        />
        <SummaryItem
          label="Skill level"
          value={draft.skillLevel ? draft.skillLevel.value : "Not selected"}
          onEdit={() => onEditStep(1)}
        />
        <SummaryItem
          label="Duration"
          value={`${draft.durationWeeks.value} weeks`}
          onEdit={() => onEditStep(2)}
        />
        <SummaryItem
          label="Study hours per week"
          value={`${draft.studyHoursPerWeek.value} hours`}
          onEdit={() => onEditStep(2)}
        />
        <SummaryItem
          label="Preferred study time"
          value={draft.studyTimeOfDay.value}
          onEdit={() => onEditStep(2)}
        />
        <SummaryItem
          label="Focus duration"
          value={`${draft.focusDurationMinutes.value} minutes`}
          onEdit={() => onEditStep(2)}
        />
        <SummaryItem
          label="Preferred formats"
          value={draft.preferredFormats.value.map((format) => formatLabels[format] ?? format).join(", ")}
          onEdit={() => onEditStep(3)}
        />
        <SummaryItem
          label="Known challenges"
          value={challengeLabels.length > 0 ? challengeLabels.join(", ") : "None selected"}
          onEdit={() => onEditStep(3)}
        />
      </dl>
    </GlassCard>
  );
}

function SummaryItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-medium capitalize">{value}</dd>
      <Button variant="ghost" size="sm" className="mt-3 h-8 px-2 text-xs" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}

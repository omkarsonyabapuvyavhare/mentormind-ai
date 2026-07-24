"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { routes } from "@/constants/routes";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function LearningTwinPreview() {
  const state = useAppStore();
  const metrics = selectDashboardMetrics(state);

  if (!state.twin) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Learning Twin preview</h3>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <MetricItem
          label="Strongest topic"
          value={metrics.strongestTopic?.topicName ?? "Building profile"}
        />
        <MetricItem
          label="Weakest topic"
          value={
            metrics.weakestTopic?.topicName ??
            (metrics.weakTopics.length > 0
              ? metrics.weakTopics[0]?.topicName
              : metrics.weakTopicsMessage)
          }
        />
        <MetricItem
          label="Preferred format"
          value={state.twin.preferences.preferredFormats.join(", ")}
        />
        <MetricItem
          label="Preferred study time"
          value={state.twin.preferences.studyTimeOfDay}
        />
        <MetricItem
          label="Focus duration"
          value={`${state.twin.preferences.focusDurationMinutes} minutes`}
        />
        <MetricItem label="Consistency score" value={`${metrics.consistencyScore}%`} />
        <MetricItem label="Learning velocity" value={`${metrics.learningVelocity} tasks/week`} />
        <MetricItem
          label="Latest quiz"
          value={
            metrics.latestQuiz
              ? `${metrics.latestQuiz.score}% · ${metrics.latestQuiz.topicId}`
              : "Not attempted yet"
          }
        />
      </dl>
      <Link
        href={routes.profile}
        className="mt-5 inline-block text-sm text-cyan-300 underline-offset-4 hover:underline"
      >
        Open full Learning Twin
      </Link>
    </GlassCard>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-medium capitalize">{value}</dd>
    </div>
  );
}

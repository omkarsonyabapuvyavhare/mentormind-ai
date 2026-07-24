"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { routes } from "@/constants/routes";
import { selectDashboardMetrics } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function WeakTopicsCard() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Topics I&apos;m watching</h3>
      {metrics.weakTopics.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{metrics.weakTopicsMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {metrics.weakTopics.map((topic) => (
            <li
              key={topic.topicId}
              className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3"
            >
              <span>{topic.topicName}</span>
              <span className="font-medium text-amber-200">{topic.score}%</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

export function AiRecommendationCard() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">AI Mentor recommendation</h3>
      <p className="mt-4 text-sm leading-7 text-foreground/90 md:text-base">
        {metrics.mentorRecommendation}
      </p>
      <Link href={routes.mentor} className="mt-4 inline-block text-sm text-cyan-300 underline-offset-4 hover:underline">
        Open AI Mentor explanation
      </Link>
    </GlassCard>
  );
}

export function RecentDecisionCard() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Last plan change I made</h3>
      <p className="mt-4 text-sm leading-7 text-foreground/90 md:text-base">
        {metrics.adaptationMessage}
      </p>
    </GlassCard>
  );
}

export function DemoStatusStrip() {
  const metrics = selectDashboardMetrics(useAppStore());

  return (
    <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Demo status</p>
          <p className="mt-1 text-sm text-muted">
            {metrics.demoProgress.completedSteps} of {metrics.demoProgress.totalSteps} demo steps
            completed
          </p>
        </div>
        <p className="text-sm text-muted">
          {metrics.unreadNudges.length} unread nudges · Roadmap v{metrics.roadmapVersion}
        </p>
      </div>
    </GlassCard>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Map, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { GoalAwareAdaptationCard } from "@/components/shared/goal-aware-adaptation-card";
import { routes } from "@/constants/routes";
import { theme } from "@/constants/theme";
import { selectPlanUpdateSummary } from "@/lib/tutor/feedback";
import { selectGoalAwareAdaptation } from "@/lib/ai/reasoning-summary";
import {
  selectLatestDecisionInjectedTasks,
  selectMilestoneIdsWithRecentChanges,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function PlanUpdatedView() {
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const adaptationReveal = useAppStore((state) => state.adaptationReveal);
  const dismissAdaptationReveal = useAppStore((state) => state.dismissAdaptationReveal);
  const state = useAppStore();

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Create your learning plan first"
        description="Your mentor will update your plan after each session."
      />
    );
  }

  if (!adaptationReveal) {
    return (
      <EmptyState title="No plan updates yet" description="Complete a session to see how your plan adapts.">
        <Button className="mt-4" onClick={() => router.push(routes.dashboard)}>
          Continue learning
        </Button>
      </EmptyState>
    );
  }

  const summary = selectPlanUpdateSummary(state, adaptationReveal.kind);
  const adaptation = selectGoalAwareAdaptation(state);
  const injectedTasks = selectLatestDecisionInjectedTasks(state);
  const changedMilestones = selectMilestoneIdsWithRecentChanges(state);
  const roadmapVersion = state.roadmap?.version ?? 0;

  const handleContinue = () => {
    dismissAdaptationReveal();
    router.push(routes.dashboard);
  };

  const handleViewRoadmap = () => {
    dismissAdaptationReveal();
    router.push(routes.roadmap);
  };

  return (
    <AppShell title="Updated Learning Plan" subtitle="Your mentor adjusted your path based on today's session.">
      <TutorFlowStepper current="plan" className="mb-2" />

      <GlassCard className={theme.cards.adaptation}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={theme.badges.injected}>
            <Map className="mr-1 h-3 w-3" />
            Plan v{roadmapVersion}
          </Badge>
          {adaptationReveal.kind === "mastery" ? (
            <Badge className={theme.badges.success}>Mastery unlocked next lesson</Badge>
          ) : adaptationReveal.kind === "weakness" ? (
            <Badge className={theme.badges.warning}>Extra practice added</Badge>
          ) : null}
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{summary.title}</h2>
        <p className="mt-3 text-sm leading-8 text-muted">{summary.body}</p>
      </GlassCard>

      {adaptation ? <GoalAwareAdaptationCard adaptation={adaptation} /> : null}

      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">What changed</p>
        <ul className="mt-4 space-y-3">
          {summary.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-7">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>

      {injectedTasks.length > 0 ? (
        <GlassCard className="animate-reveal-in">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">New tasks added</p>
          <ul className="mt-4 space-y-3">
            {injectedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-violet-400/20 bg-violet-400/5 px-4 py-3 text-sm animate-task-in"
              >
                <span>{task.title}</span>
                <Badge className={theme.badges.injected}>{task.estimatedMinutes} min</Badge>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      {changedMilestones.size > 0 ? (
        <p className="text-sm text-muted">
          {changedMilestones.size} milestone{changedMilestones.size === 1 ? "" : "s"} updated in your roadmap.
        </p>
      ) : null}

      <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-cyan-300" />
          <p className="text-sm leading-7">
            {adaptationReveal.kind === "mastery"
              ? "Your next lesson is unlocked. When you're ready, I'll guide you through it."
              : "Take a breath — the extra practice is there to help you, not slow you down."}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={handleContinue}>
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={handleViewRoadmap}>
            View full roadmap
          </Button>
        </div>
      </GlassCard>
    </AppShell>
  );
}

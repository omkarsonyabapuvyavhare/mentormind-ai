"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

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
import { selectMentorFeedback } from "@/lib/tutor/feedback";
import { selectGoalAwareAdaptation } from "@/lib/ai/reasoning-summary";
import { useAppStore } from "@/stores/use-app-store";

export function MentorFeedbackView() {
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const adaptationReveal = useAppStore((state) => state.adaptationReveal);
  const state = useAppStore();

  if (!isHydrated) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Complete a session first"
        description="Your mentor will give personalized feedback after your assessment."
      />
    );
  }

  if (!adaptationReveal) {
    return (
      <EmptyState
        title="No feedback yet"
        description="Start today's learning session to receive mentor feedback."
      >
        <Button className="mt-4" onClick={() => router.push(routes.dashboard)}>
          Go to today&apos;s mission
        </Button>
      </EmptyState>
    );
  }

  const feedback = selectMentorFeedback(state, adaptationReveal.score, adaptationReveal.kind);
  const adaptation = selectGoalAwareAdaptation(state);

  return (
    <AppShell title="Mentor Feedback" subtitle="Your AI mentor reviewed your assessment.">
      <TutorFlowStepper current="feedback" className="mb-2" />

      <GlassCard
        className={
          feedback.kind === "mastery"
            ? theme.cards.success
            : feedback.kind === "weakness"
              ? theme.cards.adaptation
              : theme.cards.highlight
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Your AI Mentor</p>
            <h2 className="mt-2 text-2xl font-semibold">{feedback.headline}</h2>
            <Badge className="mt-3 border-white/10 bg-white/5">Score · {feedback.score}%</Badge>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-sm leading-8">{feedback.reassurance}</p>
      </GlassCard>

      <GlassCard className="border-white/10">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">What I noticed</p>
        <p className="mt-3 text-sm leading-8">{feedback.explanation}</p>
      </GlassCard>

      {adaptation ? <GoalAwareAdaptationCard adaptation={adaptation} title="How I updated your plan" /> : null}

      <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
        <p className="text-sm text-muted">{feedback.nextStepHint}</p>
        <Button className="mt-4" size="lg" onClick={() => router.push(routes.planUpdated)}>
          See updated learning plan
          <ArrowRight className="h-4 w-4" />
        </Button>
      </GlassCard>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Lightbulb, Network } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { routes } from "@/constants/routes";
import { theme } from "@/constants/theme";
import { getLessonContent } from "@/data/lesson-content";
import { useLessonSessionTimer } from "@/hooks/use-lesson-session-timer";
import { selectTodayMission } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";

export function LessonView({ topicId }: { topicId: string }) {
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isInitialized = useAppStore((state) => state.isInitialized);
  const state = useAppStore();
  const mission = selectTodayMission(state);
  const lesson = getLessonContent(topicId);
  const sessionTimer = useLessonSessionTimer();

  if (!isHydrated) {
    return <LoadingSkeleton lines={8} />;
  }

  if (!isInitialized) {
    return (
      <EmptyState
        title="Create your learning plan first"
        description="Your AI mentor will guide you through lessons once your plan is ready."
      />
    );
  }

  const assessmentHref = mission.assessmentHref ?? routes.assessmentVpc;

  return (
    <AppShell title="Learning" subtitle="Study the concepts, then check your understanding.">
      <TutorFlowStepper current="learn" className="mb-2" />

      {sessionTimer.label ? (
        <GlassCard className="border-white/10 bg-white/5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className={theme.badges.demo}>Live session</Badge>
            <p className="text-sm font-medium tabular-nums">{sessionTimer.label}</p>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <BookOpen className="h-4 w-4" />
          Lesson
        </div>
        <h2 className="mt-3 text-2xl font-semibold">{lesson.title}</h2>
        <p className="mt-2 text-sm text-muted">{lesson.subtitle}</p>
      </GlassCard>

      <div className="space-y-4">
        {lesson.concepts.map((concept) => (
          <GlassCard key={concept.title}>
            <h3 className="text-lg font-semibold">{concept.title}</h3>
            <p className="mt-3 text-sm leading-8 text-muted">{concept.body}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="border-dashed border-cyan-400/25 bg-cyan-400/5">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-full max-w-md items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Network className="h-10 w-10 text-cyan-300/80" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Architecture diagram</p>
            <p className="mt-2 font-medium">{lesson.diagramLabel}</p>
            <p className="mt-1 text-sm text-muted">{lesson.diagramCaption}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className={theme.cards.success}>
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Key takeaway</p>
            <p className="mt-2 text-sm leading-8">{lesson.takeaway}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
        <p className="text-sm text-muted">
          Ready to check what stuck? Your mentor prepared a short assessment based on this lesson.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => router.push(assessmentHref)}>
            Continue to Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to today&apos;s mission</Link>
          </Button>
        </div>
      </GlassCard>
    </AppShell>
  );
}

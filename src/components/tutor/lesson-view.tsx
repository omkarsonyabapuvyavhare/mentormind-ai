"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb, Target } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TutorFlowStepper } from "@/components/tutor/tutor-flow-stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { routes } from "@/constants/routes";
import { theme } from "@/constants/theme";
import { useGeneratedLesson } from "@/hooks/use-generated-lesson";
import { useLessonSessionTimer } from "@/hooks/use-lesson-session-timer";
import { recordLessonRouteRender } from "@/lib/learn/lesson-fetch-timing";
import { resolveAssessmentHref } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";

export function LessonView({ topicId }: { topicId: string }) {
  const router = useRouter();
  const goalId = useAppStore((state) => state.roadmap?.goalId);
  const { lesson, loading, error, isHydrated, isInitialized } = useGeneratedLesson(topicId);
  const sessionTimer = useLessonSessionTimer();
  const assessmentHref = resolveAssessmentHref(useAppStore.getState(), topicId);

  useEffect(() => {
    if (isHydrated && isInitialized) {
      recordLessonRouteRender(topicId, goalId);
    }
  }, [goalId, isHydrated, isInitialized, topicId]);

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

  if (error || (!loading && !lesson)) {
    return (
      <EmptyState
        title="Lesson unavailable"
        description={error ?? "We couldn't load this lesson right now."}
      />
    );
  }

  if (loading && !lesson) {
    return (
      <AppShell title="Learning" subtitle="Study the concepts, then check your understanding.">
        <TutorFlowStepper current="learn" className="mb-2" />
        <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <BookOpen className="h-4 w-4" />
            Preparing your lesson
          </div>
          <p className="mt-4 text-lg font-medium">
            MentorMind is preparing your personalized lesson…
          </p>
          <p className="mt-2 text-sm text-muted">
            This usually takes a few seconds. Your lesson will appear here automatically.
          </p>
          <div className="mt-6">
            <LoadingSkeleton lines={6} />
          </div>
        </GlassCard>
      </AppShell>
    );
  }

  if (!lesson) {
    return null;
  }

  const generatedLabel =
    lesson.source === "ai" || lesson.source === "cache"
      ? "Generated for your learning goal"
      : "Curated for your learning goal";

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
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">{generatedLabel}</Badge>
          <Badge className="border-white/10 bg-white/5 text-muted">
            Estimated study time: {lesson.estimatedMinutes} min
          </Badge>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <BookOpen className="h-4 w-4" />
          Lesson
        </div>
        <h2 className="mt-3 text-2xl font-semibold">{lesson.title}</h2>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
          <Target className="h-4 w-4" />
          Learning objectives
        </div>
        <ul className="mt-4 space-y-2">
          {lesson.learningObjectives.map((objective) => (
            <li key={objective} className="flex items-start gap-2 text-sm leading-7 text-muted">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
              {objective}
            </li>
          ))}
        </ul>
      </GlassCard>

      <div className="space-y-4">
        {lesson.sections.map((section) => (
          <GlassCard key={section.heading}>
            <h3 className="text-lg font-semibold">{section.heading}</h3>
            <p className="mt-3 text-sm leading-8 text-muted">{section.content}</p>

            <div className="mt-6 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Practical example</p>
              <p className="mt-2 text-sm leading-7 text-muted">{section.practicalExample}</p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Common mistakes</p>
              <ul className="mt-2 space-y-2">
                {section.commonMistakes.map((mistake) => (
                  <li key={mistake} className="text-sm leading-7 text-muted">
                    • {mistake}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`mt-6 ${theme.cards.success} p-4`}>
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Key takeaways</p>
                  <ul className="mt-2 space-y-2">
                    {section.summary.map((item) => (
                      <li key={item} className="text-sm leading-7 text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="border-cyan-400/20 bg-cyan-400/5">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Check your understanding</p>
        <p className="mt-3 text-sm text-muted">
          Take a short topic check-in based on this lesson. Your mentor will use the results to adapt
          your roadmap.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {assessmentHref ? (
            <Button size="lg" onClick={() => router.push(assessmentHref)}>
              Start topic check-in
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to today&apos;s mission</Link>
          </Button>
        </div>
      </GlassCard>
    </AppShell>
  );
}

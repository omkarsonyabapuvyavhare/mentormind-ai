import Link from "next/link";
import { ArrowRight, BrainCircuit, RefreshCw, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageContainer } from "@/components/shared/page-container";
import { routes } from "@/constants/routes";

const pillars = [
  {
    title: "Learning Twin",
    description:
      "A continuously evolving learner memory built from quizzes, tasks, streaks, and study patterns.",
    icon: BrainCircuit,
  },
  {
    title: "AI Decision Engine",
    description:
      "Deterministic rules that adapt your roadmap when performance, inactivity, or mastery signals change.",
    icon: RefreshCw,
  },
  {
    title: "Closed-Loop Learning",
    description:
      "Every learner event updates the twin, triggers decisions, and reshapes what you study next.",
    icon: Target,
  },
];

const learningLoopSteps = [
  "Describe your learning goal",
  "Get a personalized roadmap",
  "Study today's lesson",
  "Complete a topic check-in",
  "Roadmap adapts automatically",
  "Your AI mentor explains why",
];

export function LandingView() {
  return (
    <PageContainer className="flex min-h-screen flex-col px-4 py-10 md:px-8">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">MentorMind AI</p>
          <p className="text-xs text-muted">Your AI Mentor</p>
        </div>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Adaptive learning</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Your <span className="text-gradient">AI mentor</span> for goal-driven learning
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
            Describe your goal in plain language, study personalized lessons, and let MentorMind adapt
            your roadmap from every assessment signal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={routes.onboarding}>
                Create My Learning Plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <GlassCard>
          <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Your learning loop</p>
          <ol className="mt-5 space-y-3 text-sm">
            {learningLoopSteps.map((step, index) => (
              <li
                key={step}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-medium">
                  {index + 1}. {step}
                </p>
              </li>
            ))}
          </ol>
        </GlassCard>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <GlassCard key={pillar.title}>
              <Icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-4 text-lg font-semibold">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{pillar.description}</p>
            </GlassCard>
          );
        })}
      </section>
    </PageContainer>
  );
}

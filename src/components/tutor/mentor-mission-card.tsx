"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { MENTOR_VOICE } from "@/constants/mentor-voice";
import { selectTodayMission } from "@/lib/tutor/mission";
import { useAppStore } from "@/stores/use-app-store";

export function MentorMissionCard() {
  const router = useRouter();
  const state = useAppStore();
  const mission = selectTodayMission(state);

  return (
    <div className="space-y-6">
      <GlassCard className={theme.cards.highlight}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{MENTOR_VOICE.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              Welcome back. Here&apos;s today&apos;s focus.
            </h2>
            <p className="mt-3 text-sm text-muted">
              Working toward: <span className="text-foreground">{mission.learnerGoal}</span>
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className={theme.cards.adaptation}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-violet-200">
          <Target className="h-4 w-4" />
          Today&apos;s learning goal
        </div>
        <p className="mt-4 text-xl font-semibold leading-snug md:text-2xl">{mission.goal}</p>

        <dl className="mt-6 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-2">
          <MissionField label="Why this lesson" value={mission.why} />
          <MissionField
            label="Estimated duration"
            value={`${mission.estimatedMinutes} minutes`}
            icon={<Clock className="h-4 w-4 text-cyan-300" />}
          />
          <MissionField
            label="Expected outcome"
            value={mission.expectedOutcome}
            className="md:col-span-2"
          />
        </dl>

        <div className="mt-8 border-t border-white/10 pt-6">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push(mission.lessonHref)}>
            Start Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

function MissionField({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-7">{value}</dd>
    </div>
  );
}

"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { routes } from "@/constants/routes";
import { selectNextBestAction } from "@/lib/ai/mentor-responses";
import { selectNextTask } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function NextBestActionCard() {
  const state = useAppStore();
  const nextAction = selectNextBestAction(state);
  const nextTask = selectNextTask(state);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold">Next best action</h3>
      <p className="mt-4 text-sm leading-7">{nextAction}</p>
      {nextTask ? (
        <Button asChild className="mt-5">
          <Link href={routes.roadmap}>Start next task</Link>
        </Button>
      ) : null}
    </GlassCard>
  );
}

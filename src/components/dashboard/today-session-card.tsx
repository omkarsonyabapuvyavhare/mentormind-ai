"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { selectSecondarySessionActions, selectSessionPrimaryAction } from "@/lib/demo/session-actions";
import { useAppStore } from "@/stores/use-app-store";

export function TodaySessionCard() {
  const state = useAppStore();
  const primary = selectSessionPrimaryAction(state);
  const secondary = selectSecondarySessionActions(state);

  return (
    <GlassCard className={theme.cards.highlight}>
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Your next step</p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xl font-semibold md:text-2xl">{primary.label}</p>
          {primary.hint ? <p className="mt-2 text-sm text-muted">{primary.hint}</p> : null}
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={primary.href}>
            {primary.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {secondary.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          {secondary.map((action) => (
            <Button key={`${action.href}-${action.label}`} asChild variant="ghost" size="sm">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
}

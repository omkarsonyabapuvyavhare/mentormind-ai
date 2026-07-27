"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { FastForward, RotateCcw, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { usePresenterControlActions } from "@/hooks/use-presenter-control-actions";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { useAppStore } from "@/stores/use-app-store";

export type PresenterControlsLayout = "inline" | "floating";

export interface PresenterControlHandlers {
  onSimulateWeak?: () => void;
  onSimulateMastery?: () => void;
  onFastForward?: () => void;
  onReset?: () => void;
}

export interface PresenterControlsProps {
  layout?: PresenterControlsLayout;
  assessment?: TopicAssessment;
  disabled?: boolean;
  /** Inline assessment overrides — runs the full quiz analysis flow in QuizShell. */
  handlers?: PresenterControlHandlers;
}

function PresenterControlsPanel({
  layout,
  missionTopicId,
  disabled,
  onSimulateWeak,
  onSimulateMastery,
  onFastForward,
  onReset,
}: {
  layout: PresenterControlsLayout;
  missionTopicId: string;
  disabled?: boolean;
  onSimulateWeak: () => void;
  onSimulateMastery: () => void;
  onFastForward: () => void;
  onReset: () => void;
}) {
  const isInline = layout === "inline";

  return (
    <GlassCard
      className={
        isInline
          ? `${theme.cards.warning} border-t border-amber-400/20`
          : `${theme.cards.warning} fixed bottom-4 right-4 z-50 w-[min(100%,20rem)] border-amber-400/20 shadow-2xl`
      }
    >
      <Badge className={theme.badges.demo}>Presenter controls</Badge>
      {isInline ? (
        <p className="mt-3 text-sm text-muted">
          Demo shortcuts for this assessment — results flow through the Decision Engine.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm font-medium">Hidden simulation shortcuts</p>
          <p className="mt-1 text-xs text-muted">Current topic: {missionTopicId || "none selected"}</p>
          <p className="mt-1 text-xs text-muted">Alt+4 weak · Alt+1 mastery · Alt+R reset</p>
        </>
      )}
      <div className={`mt-4 flex flex-col gap-2 ${isInline ? "sm:grid sm:grid-cols-2" : ""}`}>
        <Button size="sm" variant="secondary" disabled={disabled} onClick={onSimulateWeak}>
          <Zap className="h-4 w-4" />
          Simulate 42%
        </Button>
        <Button size="sm" variant="secondary" disabled={disabled} onClick={onSimulateMastery}>
          <Zap className="h-4 w-4" />
          Simulate 95%
        </Button>
        <Button size="sm" variant="secondary" disabled={disabled} onClick={onFastForward}>
          <FastForward className="h-4 w-4" />
          Fast Forward 3 Days
        </Button>
        <Button size="sm" variant="destructive" disabled={disabled} onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset journey
        </Button>
      </div>
    </GlassCard>
  );
}

export function PresenterControls({
  layout = "floating",
  assessment,
  disabled = false,
  handlers,
}: PresenterControlsProps) {
  const pathname = usePathname();
  const presenterMode = useAppStore((state) => state.presenterMode);
  const syncPresenterMode = useAppStore((state) => state.syncPresenterMode);
  const { simulate, handleReset, handleFastForward, mission, weakScore, masteryScore } =
    usePresenterControlActions(assessment);

  const onSimulateWeak = handlers?.onSimulateWeak ?? (() => simulate(weakScore));
  const onSimulateMastery = handlers?.onSimulateMastery ?? (() => simulate(masteryScore));
  const onFastForward = handlers?.onFastForward ?? handleFastForward;
  const onReset = handlers?.onReset ?? handleReset;

  useEffect(() => {
    if (presenterMode) {
      return;
    }

    syncPresenterMode(undefined, "presenter-controls:self-heal");
  }, [presenterMode, syncPresenterMode]);

  useEffect(() => {
    if (!presenterMode) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }

      if (event.key === "4") {
        event.preventDefault();
        simulate(weakScore);
      }

      if (event.key === "1") {
        event.preventDefault();
        simulate(masteryScore);
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleReset, masteryScore, presenterMode, simulate, weakScore]);

  if (!presenterMode) {
    if (process.env.NODE_ENV === "development") {
      console.info("[PresenterControls]", {
        layout,
        pathname,
        presenterMode,
        assessmentProvided: Boolean(assessment),
        rendered: false,
      });
    }
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[PresenterControls]", {
      layout,
      pathname,
      presenterMode,
      assessmentProvided: Boolean(assessment),
      rendered: true,
    });
  }

  return (
    <PresenterControlsPanel
      layout={layout}
      missionTopicId={mission.topicId}
      disabled={disabled}
      onSimulateWeak={onSimulateWeak}
      onSimulateMastery={onSimulateMastery}
      onFastForward={onFastForward}
      onReset={onReset}
    />
  );
}

/** Global floating toolbar — hidden on assessment routes where inline controls render. */
export function FloatingPresenterControls() {
  const pathname = usePathname();
  const presenterMode = useAppStore((state) => state.presenterMode);

  if (!presenterMode || pathname.startsWith("/assessment")) {
    return null;
  }

  return <PresenterControls layout="floating" />;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { FastForward, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import { usePresenterControlActions } from "@/hooks/use-presenter-control-actions";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { useAppStore } from "@/stores/use-app-store";

export type PresenterControlsLayout = "inline" | "floating";
export type PresenterControlsVariant = "assessment" | "dashboard";

export interface PresenterControlHandlers {
  onSimulateWeak?: () => void;
  onSimulateMastery?: () => void;
  onFastForward?: () => void;
  onReset?: () => void;
}

export interface PresenterControlsProps {
  variant: PresenterControlsVariant;
  layout?: PresenterControlsLayout;
  assessment?: TopicAssessment;
  disabled?: boolean;
  /** Mount keyboard shortcuts only — no visible panel (dashboard). */
  shortcutsOnly?: boolean;
  /** Inline assessment overrides — runs the full quiz analysis flow in QuizShell. */
  handlers?: PresenterControlHandlers;
}

function PresenterControlsPanel({
  variant,
  layout,
  missionTopicId,
  disabled,
  onSimulateWeak,
  onSimulateMastery,
  onFastForward,
}: {
  variant: PresenterControlsVariant;
  layout: PresenterControlsLayout;
  missionTopicId: string;
  disabled?: boolean;
  onSimulateWeak: () => void;
  onSimulateMastery: () => void;
  onFastForward: () => void;
}) {
  const isAssessmentVariant = variant === "assessment";
  const isDashboardVariant = variant === "dashboard";
  const isInline = layout === "inline";

  return (
    <GlassCard
      className={
        isInline
          ? isDashboardVariant
            ? `${theme.cards.warning} w-full border-t border-amber-400/20`
            : `${theme.cards.warning} border-t border-amber-400/20`
          : `${theme.cards.warning} fixed bottom-4 right-4 z-50 w-[min(100%,20rem)] border-amber-400/20 shadow-2xl`
      }
    >
      <Badge className={theme.badges.demo}>Presenter controls</Badge>
      {isAssessmentVariant ? (
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
      <div
        className={
          isAssessmentVariant
            ? "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "mt-4 flex flex-col gap-3 sm:flex-row"
        }
      >
        {isAssessmentVariant ? (
          <>
            <Button disabled={disabled} onClick={onSimulateWeak}>
              <Zap className="h-4 w-4" />
              Submit 42% Score
            </Button>
            <Button disabled={disabled} onClick={onSimulateMastery}>
              <Zap className="h-4 w-4" />
              Submit 95% Score
            </Button>
          </>
        ) : null}
        {isDashboardVariant ? (
          <Button disabled={disabled} onClick={onFastForward}>
            <FastForward className="h-4 w-4" />
            Fast Forward 3 Days
          </Button>
        ) : null}
      </div>
    </GlassCard>
  );
}

export function PresenterControls({
  variant,
  layout = "inline",
  assessment,
  disabled = false,
  shortcutsOnly = false,
  handlers,
}: PresenterControlsProps) {
  const pathname = usePathname();
  const presenterMode = useAppStore((state) => state.presenterMode);
  const syncPresenterMode = useAppStore((state) => state.syncPresenterMode);
  const envPresenterMode = process.env.NEXT_PUBLIC_PRESENTER_MODE === "true";
  const showAssessmentControls = envPresenterMode || presenterMode;
  const showDashboardControls = presenterMode || envPresenterMode;
  const showPresenterControls =
    variant === "assessment" ? showAssessmentControls : showDashboardControls;
  const isAssessmentRoute = pathname.startsWith("/assessment/");
  const isDashboardRoute = pathname === "/dashboard";
  const { simulate, handleReset, handleFastForward, mission, weakScore, masteryScore } =
    usePresenterControlActions(assessment);

  const onSimulateWeak = handlers?.onSimulateWeak ?? (() => simulate(weakScore));
  const onSimulateMastery = handlers?.onSimulateMastery ?? (() => simulate(masteryScore));
  const onFastForward = handlers?.onFastForward ?? handleFastForward;

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

  if (
    !showPresenterControls ||
    (variant === "assessment" && !isAssessmentRoute) ||
    (variant === "dashboard" && !isDashboardRoute)
  ) {
    if (process.env.NODE_ENV === "development") {
      console.info("[PresenterControls]", {
        variant,
        layout,
        pathname,
        presenterMode,
        envPresenterMode,
        showAssessmentControls,
        showDashboardControls,
        isAssessmentRoute,
        isDashboardRoute,
        assessmentProvided: Boolean(assessment),
        rendered: false,
      });
    }
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[PresenterControls]", {
      variant,
      layout,
      pathname,
      presenterMode,
      envPresenterMode,
      showAssessmentControls,
      showDashboardControls,
      isAssessmentRoute,
      isDashboardRoute,
      assessmentProvided: Boolean(assessment),
      shortcutsOnly,
      rendered: !shortcutsOnly,
    });
  }

  if (shortcutsOnly) {
    return null;
  }

  return (
    <PresenterControlsPanel
      variant={variant}
      layout={layout}
      missionTopicId={mission.topicId}
      disabled={disabled}
      onSimulateWeak={onSimulateWeak}
      onSimulateMastery={onSimulateMastery}
      onFastForward={onFastForward}
    />
  );
}

/** Deprecated — dashboard uses LearnerEngagementPanel for Fast Forward; shortcuts mount via shortcutsOnly. */
export function FloatingPresenterControls() {
  return null;
}

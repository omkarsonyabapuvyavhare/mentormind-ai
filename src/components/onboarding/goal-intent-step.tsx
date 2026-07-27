"use client";



import { useState } from "react";



import { IntentSuccessCard } from "@/components/onboarding/intent-success-card";

import { IntentUnderstandingOverlay } from "@/components/onboarding/intent-understanding-overlay";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { GlassCard } from "@/components/ui/glass-card";

import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";

import { fetchParsedIntentWithMinimumDelay } from "@/lib/onboarding/fetch-parsed-intent";

import { formatDraftGoalSummary } from "@/lib/onboarding/format-intent-success";

import {

  GOAL_INTENT_AI_BADGE,

  GOAL_INTENT_GENERATE_LABEL,

  GOAL_INTENT_MANUAL_LABEL,

  GOAL_INTENT_PLACEHOLDER,

  GOAL_INTENT_TITLE,

} from "@/lib/onboarding/goal-intent-constants";

import {

  createDraftFromParseResponse,

  type OnboardingDraft,

} from "@/lib/onboarding/onboarding-draft";



type GoalIntentPhase = "input" | "loading" | "success";



export function GoalIntentStep({

  onComplete,

  onManualSetup,

}: {

  onComplete: (draft: OnboardingDraft, context?: RoadmapGenerationContext) => void;

  onManualSetup: () => void;

}) {

  const [goalText, setGoalText] = useState("");

  const [phase, setPhase] = useState<GoalIntentPhase>("input");

  const [draft, setDraft] = useState<OnboardingDraft | null>(null);



  const handleGenerate = async () => {

    setPhase("loading");



    const response = await fetchParsedIntentWithMinimumDelay(goalText);

    const nextDraft = createDraftFromParseResponse(response, goalText);

    setDraft(nextDraft);

    setPhase("success");

  };



  const handleContinue = () => {

    if (!draft) {

      return;

    }



    onComplete(draft, {

      goal: draft.goalTitle,

      domain: draft.goalCategory,

      targetOutcome: draft.targetOutcome,

      recommendedFocusAreas: draft.recommendedFocusAreas,

    });

  };



  if (phase === "loading") {

    return <IntentUnderstandingOverlay />;

  }



  if (phase === "success" && draft) {

    return (

      <IntentSuccessCard

        summary={formatDraftGoalSummary(draft)}

        onContinue={handleContinue}

      />

    );

  }



  return (

    <GlassCard className="border-cyan-400/10">

      <h2 className="text-xl font-semibold tracking-tight">{GOAL_INTENT_TITLE}</h2>

      <Badge className="mt-4 border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-cyan-100">

        {GOAL_INTENT_AI_BADGE}

      </Badge>

      <textarea

        className="mt-4 min-h-44 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-7 text-foreground outline-none transition-all placeholder:text-muted/80 focus:border-cyan-400/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/10"

        value={goalText}

        onChange={(event) => setGoalText(event.target.value)}

        placeholder={GOAL_INTENT_PLACEHOLDER}

        aria-label={GOAL_INTENT_TITLE}

      />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <button

          type="button"

          onClick={onManualSetup}

          className="text-sm text-muted transition-colors hover:text-foreground"

        >

          {GOAL_INTENT_MANUAL_LABEL}

        </button>

        <Button onClick={handleGenerate} className="w-full sm:w-auto sm:min-w-[220px]">

          {GOAL_INTENT_GENERATE_LABEL}

        </Button>

      </div>

    </GlassCard>

  );

}



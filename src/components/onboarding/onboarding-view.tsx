"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AvailabilityStep } from "@/components/onboarding/availability-step";
import { GoalIntentStep } from "@/components/onboarding/goal-intent-step";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { OnboardingSummary } from "@/components/onboarding/onboarding-summary";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { SkillLevelStep } from "@/components/onboarding/skill-level-step";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { savePendingOnboarding } from "@/lib/onboarding/fetch-generated-roadmap";
import { ONBOARDING_PAGE_SUBTITLE } from "@/lib/onboarding/goal-intent-constants";
import {
  createManualOnboardingDraft,
  draftToOnboardingInput,
  draftToRoadmapContext,
  isDraftStepValid,
  type OnboardingDraft,
  type OnboardingPhase,
} from "@/lib/onboarding/onboarding-draft";
import { mapFocusAreasToTopicIds } from "@/lib/onboarding/map-parsed-intent";
import { onboardingInputSchema } from "@/lib/onboarding/schema";
import type { LearningFormat, SkillLevel, StudyTimeOfDay } from "@/types/learning-twin";

const TOTAL_STEPS = 5;

function resolveChallengeLabels(draft: OnboardingDraft): string[] {
  const focusAreas =
    draft.recommendedFocusAreas.length > 0
      ? draft.recommendedFocusAreas
      : inferFocusAreas(draft.goalTitle, draft.goalCategory);

  const labelsById = new Map(
    focusAreas.map((area) => [mapFocusAreaToTopicId(area, draft.goalSlug), area]),
  );

  return draft.knownChallengeTopicIds.value.map(
    (topicId) => labelsById.get(topicId) ?? topicId.replace(/-/g, " "),
  );
}

function mapFocusAreaToTopicId(area: string, goalSlug: string): string {
  return mapFocusAreasToTopicIds([area], goalSlug)[0]!;
}

export function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<OnboardingPhase>("idle");
  const [draft, setDraft] = useState<OnboardingDraft>(() => createManualOnboardingDraft());
  const [roadmapContext, setRoadmapContext] = useState<RoadmapGenerationContext | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const challengeLabels = useMemo(() => resolveChallengeLabels(draft), [draft]);

  const handleNext = () => {
    setError(null);

    if (!isDraftStepValid(draft, step)) {
      if (step === 1) {
        setError("Select your current skill level before continuing.");
      } else {
        setError("Complete the required fields before continuing.");
      }
      return;
    }

    setStep((current) => {
      const next = Math.min(current + 1, TOTAL_STEPS - 1);
      setPhase(next === 1 ? "collectingSkillLevel" : next === 2 ? "collectingAvailability" : next === 3 ? "collectingPreferences" : next === 4 ? "reviewingSummary" : "idle");
      return next;
    });
  };

  const handleBack = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    setError(null);

    if (!isDraftStepValid(draft, 4)) {
      setError("Review and confirm all onboarding details before generating your plan.");
      return;
    }

    const input = draftToOnboardingInput(draft);
    const parsed = onboardingInputSchema.safeParse(input);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid onboarding input.");
      return;
    }

    setSubmitting(true);
    setPhase("generatingRoadmap");
    savePendingOnboarding({
      input: parsed.data,
      context: roadmapContext ?? draftToRoadmapContext(draft),
    });
    router.push(routes.onboardingLoading);
  };

  const handleIntentComplete = (nextDraft: OnboardingDraft, context?: RoadmapGenerationContext) => {
    setError(null);
    setDraft(nextDraft);
    setRoadmapContext(context);
    setPhase("collectingSkillLevel");
    setStep(1);
  };

  const handleManualSetup = () => {
    setError(null);
    setDraft(createManualOnboardingDraft());
    setRoadmapContext(undefined);
    setPhase("collectingSkillLevel");
    setStep(1);
  };

  const updateSkillLevel = (skillLevel: SkillLevel) => {
    setDraft((current) => ({
      ...current,
      skillLevel: { value: skillLevel, source: "manual" },
      skillLevelConfirmed: true,
    }));
  };

  const updateDuration = (durationWeeks: number) => {
    setDraft((current) => ({
      ...current,
      durationWeeks: { value: durationWeeks, source: "manual" },
    }));
  };

  const updateHours = (studyHoursPerWeek: number) => {
    setDraft((current) => ({
      ...current,
      studyHoursPerWeek: { value: studyHoursPerWeek, source: "manual" },
    }));
  };

  const updateStudyTime = (studyTimeOfDay: StudyTimeOfDay) => {
    setDraft((current) => ({
      ...current,
      studyTimeOfDay: { value: studyTimeOfDay, source: "manual" },
    }));
  };

  const updateFocusDuration = (focusDurationMinutes: number) => {
    setDraft((current) => ({
      ...current,
      focusDurationMinutes: { value: focusDurationMinutes, source: "manual" },
    }));
  };

  const updateFormats = (preferredFormats: LearningFormat[]) => {
    setDraft((current) => ({
      ...current,
      preferredFormats: { value: preferredFormats, source: "manual" },
    }));
  };

  const updateChallenges = (knownChallengeTopicIds: string[]) => {
    setDraft((current) => ({
      ...current,
      knownChallengeTopicIds: { value: knownChallengeTopicIds, source: "manual" },
    }));
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">MentorMind AI</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your learning plan</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{ONBOARDING_PAGE_SUBTITLE}</p>
      </div>

      <OnboardingStepper currentStep={step} />

      <div className="mt-6 space-y-6">
        {step === 0 ? (
          <GoalIntentStep onComplete={handleIntentComplete} onManualSetup={handleManualSetup} />
        ) : null}
        {step === 1 ? (
          <SkillLevelStep
            value={draft.skillLevel?.value ?? null}
            suggestion={draft.skillLevelSuggestion}
            onChange={updateSkillLevel}
          />
        ) : null}
        {step === 2 ? (
          <AvailabilityStep
            durationWeeks={draft.durationWeeks.value}
            studyHoursPerWeek={draft.studyHoursPerWeek.value}
            studyTimeOfDay={draft.studyTimeOfDay.value}
            focusDurationMinutes={draft.focusDurationMinutes.value}
            durationSource={draft.durationWeeks.source}
            hoursSource={draft.studyHoursPerWeek.source}
            studyTimeSource={draft.studyTimeOfDay.source}
            focusSource={draft.focusDurationMinutes.source}
            onDurationChange={updateDuration}
            onHoursChange={updateHours}
            onStudyTimeChange={updateStudyTime}
            onFocusDurationChange={updateFocusDuration}
          />
        ) : null}
        {step === 3 ? (
          <PreferencesStep
            draft={draft}
            onFormatsChange={updateFormats}
            onChallengesChange={updateChallenges}
          />
        ) : null}
        {step === 4 ? (
          <OnboardingSummary
            draft={draft}
            challengeLabels={challengeLabels}
            onEditStep={setStep}
          />
        ) : null}

        {error ? <p className="text-sm text-amber-300">{error}</p> : null}

        {step > 0 ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={handleBack} disabled={submitting}>
              Back
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={handleNext}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || phase === "generatingRoadmap"}>
                Generate my personalized plan
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

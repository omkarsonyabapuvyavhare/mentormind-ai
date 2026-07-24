"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvailabilityStep } from "@/components/onboarding/availability-step";
import { GoalStep } from "@/components/onboarding/goal-step";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { OnboardingSummary } from "@/components/onboarding/onboarding-summary";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { SkillLevelStep } from "@/components/onboarding/skill-level-step";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { buildIntentSummary } from "@/lib/onboarding/create-from-input";
import { onboardingDefaults, onboardingInputSchema } from "@/lib/onboarding/schema";
import { useAppStore } from "@/stores/use-app-store";

const TOTAL_STEPS = 5;

export function OnboardingView() {
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState(onboardingDefaults);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const summary = buildIntentSummary(input);

  const handleQuickStart = () => {
    setError(null);
    setSubmitting(true);
    completeOnboarding(onboardingDefaults, new Date().toISOString());
    router.push(routes.onboardingLoading);
  };

  const handleNext = () => {
    setError(null);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    setError(null);
    const parsed = onboardingInputSchema.safeParse(input);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid onboarding input.");
      return;
    }

    setSubmitting(true);
    completeOnboarding(parsed.data, new Date().toISOString());
    router.push(routes.onboardingLoading);
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">MentorMind AI</p>
        <h1 className="mt-2 text-3xl font-semibold">Create your learning plan</h1>
        <p className="mt-3 text-sm text-muted">
          Convert your certification goal into a structured learner profile and executable roadmap.
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          size="sm"
          onClick={handleQuickStart}
          disabled={submitting}
        >
          Quick start with AWS defaults
        </Button>
      </div>

      <OnboardingStepper currentStep={step} />

      <div className="mt-6 space-y-6">
        {step === 0 ? (
          <GoalStep value={input.goalId} onChange={(goalId) => setInput({ ...input, goalId })} />
        ) : null}
        {step === 1 ? (
          <SkillLevelStep
            value={input.skillLevel}
            onChange={(skillLevel) => setInput({ ...input, skillLevel })}
          />
        ) : null}
        {step === 2 ? (
          <AvailabilityStep
            durationWeeks={input.durationWeeks}
            studyHoursPerWeek={input.studyHoursPerWeek}
            onDurationChange={(durationWeeks) => setInput({ ...input, durationWeeks })}
            onHoursChange={(studyHoursPerWeek) => setInput({ ...input, studyHoursPerWeek })}
          />
        ) : null}
        {step === 3 ? (
          <PreferencesStep input={input} onChange={(patch) => setInput({ ...input, ...patch })} />
        ) : null}
        {step === 4 ? <OnboardingSummary input={input} summary={summary} /> : null}

        {error ? <p className="text-sm text-amber-300">{error}</p> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={handleBack} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              Generate my roadmap
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

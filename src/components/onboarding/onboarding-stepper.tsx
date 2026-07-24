"use client";

const steps = ["Goal", "Skill level", "Availability", "Preferences", "Summary"] as const;

export function OnboardingStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, index) => {
        const active = index === currentStep;
        const complete = index < currentStep;

        return (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
              active
                ? "bg-cyan-500/20 text-cyan-200"
                : complete
                  ? "bg-white/10 text-foreground"
                  : "bg-white/5 text-muted"
            }`}
          >
            {index + 1}. {label}
          </li>
        );
      })}
    </ol>
  );
}

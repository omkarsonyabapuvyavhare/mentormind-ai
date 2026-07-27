export const ROADMAP_GENERATION_TITLE = "MentorMind is building your personalized roadmap...";

export const ROADMAP_GENERATION_SUBTITLE =
  "Your AI mentor is sequencing milestones, lessons, and assessments for your goal.";

export const ROADMAP_GENERATION_STEPS = [
  "Structuring your learning path",
  "Sequencing milestones",
  "Personalizing lessons and assessments",
  "Finalizing your roadmap",
] as const;

export const ONBOARDING_PROFILE_STEPS = [
  "Reading your goal",
  "Building Learning Twin",
  "Generating roadmap",
  "Preparing your mentor",
] as const;

/** Minimum overlay time so progress labels feel intentional, not fake percentages. */
export const ROADMAP_GENERATION_MIN_MS = 2_000;

/** Overlay duration while Gemini generates the roadmap. */
export const ROADMAP_GENERATION_OVERLAY_MS = 8_000;

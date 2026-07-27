import { demoLearnerId } from "@/lib/roadmap/generate-initial";
import type { AppState } from "@/stores/store-types";

function isLegacyDemoLearner(
  state: Pick<AppState, "twin" | "roadmap">,
): boolean {
  return state.twin?.id === demoLearnerId && state.roadmap !== null;
}

/** Legacy script runner is active once step 1 (initialize) is complete. */
export function isDemoInProgress(
  state: Pick<AppState, "isInitialized" | "twin" | "roadmap" | "demoStepIndex">,
): boolean {
  return (
    state.isInitialized &&
    isLegacyDemoLearner(state) &&
    state.demoStepIndex >= 1
  );
}

/** Legacy demo baseline exists but script has not advanced past initialize. */
export function isCleanDemoBaseline(
  state: Pick<AppState, "isInitialized" | "twin" | "roadmap" | "demoStepIndex">,
): boolean {
  return (
    state.isInitialized &&
    isLegacyDemoLearner(state) &&
    state.demoStepIndex === 0
  );
}

/** Index after auto-skipping the initialize step — next action is 42% quiz failure. */
export const demoEntryStepIndex = 1;

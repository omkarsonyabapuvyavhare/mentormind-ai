import type { AppState } from "@/stores/store-types";

/** Demo is actively in progress once step 1 (initialize) is complete. */
export function isDemoInProgress(state: Pick<AppState, "isInitialized" | "demoMode" | "twin" | "roadmap" | "demoStepIndex">): boolean {
  return (
    state.isInitialized &&
    state.demoMode &&
    state.twin !== null &&
    state.roadmap !== null &&
    state.demoStepIndex >= 1
  );
}

/** Clean demo baseline exists but presenter has not advanced past initialize. */
export function isCleanDemoBaseline(state: Pick<AppState, "isInitialized" | "demoMode" | "twin" | "roadmap" | "demoStepIndex">): boolean {
  return (
    state.isInitialized &&
    state.demoMode &&
    state.twin !== null &&
    state.roadmap !== null &&
    state.demoStepIndex === 0
  );
}

/** Index after auto-skipping the initialize step — next action is 42% quiz failure. */
export const demoEntryStepIndex = 1;

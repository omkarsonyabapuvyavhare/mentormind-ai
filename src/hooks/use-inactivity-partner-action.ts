"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  buildReturnWelcomeMessage,
  type AccountabilityPartnerMessage,
} from "@/lib/ai/accountability-nudge";
import { useAppStore } from "@/stores/use-app-store";

/** Brief pause so the welcome-back card replaces the inactivity card before entering the session. */
export const INACTIVITY_WELCOME_TRANSITION_MS = 1400;

export function useInactivityPartnerAction() {
  const router = useRouter();
  const acknowledgeLearnerReturn = useAppStore((state) => state.acknowledgeLearnerReturn);
  const clearReturnWelcome = useAppStore((state) => state.clearReturnWelcome);
  const timeoutRef = useRef<number | null>(null);

  const handlePartnerAction = useCallback(
    (message: AccountabilityPartnerMessage): boolean => {
      if (message.templateId === "inactivity" && message.source === "nudge") {
        acknowledgeLearnerReturn(buildReturnWelcomeMessage(useAppStore.getState()));

        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          clearReturnWelcome();
          router.push(message.action.href);
          timeoutRef.current = null;
        }, INACTIVITY_WELCOME_TRANSITION_MS);

        return true;
      }

      if (message.source === "welcome_back") {
        clearReturnWelcome();
      }

      return false;
    },
    [acknowledgeLearnerReturn, clearReturnWelcome, router],
  );

  return handlePartnerAction;
}

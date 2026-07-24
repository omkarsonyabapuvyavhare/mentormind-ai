"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { formatSessionDuration } from "@/lib/time/format-relative-last-seen";

const SESSION_TICK_MS = 1_000;

function subscribeToClient(_listener: () => void) {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerClientSnapshot() {
  return false;
}

/** Presentation-only lesson session timer; starts on mount, clears on unmount. */
export function useLessonSessionTimer() {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerClientSnapshot,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const startedAt = Date.now();

    const intervalId = globalThis.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1_000));
    }, SESSION_TICK_MS);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [isClient]);

  return {
    elapsedSeconds,
    label: isClient ? `Current session: ${formatSessionDuration(elapsedSeconds)}` : null,
  };
}

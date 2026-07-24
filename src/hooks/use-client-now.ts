"use client";

import { useSyncExternalStore } from "react";

/** Shared client clock tick — one interval for all subscribers. */
export const CLIENT_NOW_TICK_MS = 45_000;

let currentNow = new Date();
let intervalId: ReturnType<typeof globalThis.setInterval> | undefined;
const listeners = new Set<() => void>();

function emitNow() {
  currentNow = new Date();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (intervalId === undefined && typeof window !== "undefined") {
    currentNow = new Date();
    intervalId = globalThis.setInterval(emitNow, CLIENT_NOW_TICK_MS);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && intervalId !== undefined) {
      globalThis.clearInterval(intervalId);
      intervalId = undefined;
    }
  };
}

function getSnapshot() {
  return currentNow.getTime();
}

function getServerSnapshot() {
  return 0;
}

function subscribeToClient(_listener: () => void) {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerClientSnapshot() {
  return false;
}

/** Returns null on the server/first SSR pass to avoid hydration mismatches. */
export function useClientNow(): Date | null {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerClientSnapshot,
  );
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) {
    return null;
  }

  return new Date(tick);
}

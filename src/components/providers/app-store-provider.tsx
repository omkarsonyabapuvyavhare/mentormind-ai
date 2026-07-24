"use client";

import { useEffect } from "react";

import { hydrateAppStore, useAppStore } from "@/stores/use-app-store";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const setHydrated = useAppStore((state) => state.setHydrated);

  useEffect(() => {
    void hydrateAppStore().finally(() => {
      setHydrated(true);
    });
  }, [setHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted">
        Loading MentorMind AI...
      </div>
    );
  }

  return children;
}

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAppStore } from "@/stores/use-app-store";

export function usePresenterModeBootstrap(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const presenterMode = useAppStore((state) => state.presenterMode);
  const syncPresenterMode = useAppStore((state) => state.syncPresenterMode);

  useEffect(() => {
    const search = searchParams.toString();
    const query = search ? `?${search}` : undefined;
    syncPresenterMode(query, `bootstrap:${pathname}`);
  }, [pathname, searchParams, syncPresenterMode]);

  return presenterMode;
}

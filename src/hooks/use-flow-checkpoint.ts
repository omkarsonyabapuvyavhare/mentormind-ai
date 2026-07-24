"use client";

import { useEffect } from "react";

import type { DemoFlowHint } from "@/lib/demo/flow-hint";
import { useAppStore } from "@/stores/use-app-store";

export function useFlowCheckpoint(hint: DemoFlowHint, active: boolean) {
  const markFlowCheckpoint = useAppStore((state) => state.markFlowCheckpoint);

  useEffect(() => {
    if (active) {
      markFlowCheckpoint(hint);
    }
  }, [active, hint, markFlowCheckpoint]);
}

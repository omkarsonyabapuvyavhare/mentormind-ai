"use client";

import type { FieldSource } from "@/lib/onboarding/onboarding-draft";
import { formatFieldSourceLabel } from "@/lib/onboarding/onboarding-draft";

export function FieldHintBadge({ source }: { source: FieldSource }) {
  const tone =
    source === "explicit"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      : source === "ai-suggested"
        ? "border-violet-400/20 bg-violet-400/10 text-violet-100"
        : source === "default"
          ? "border-white/10 bg-white/5 text-muted"
          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";

  return (
    <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] ${tone}`}>
      {formatFieldSourceLabel(source)}
    </span>
  );
}

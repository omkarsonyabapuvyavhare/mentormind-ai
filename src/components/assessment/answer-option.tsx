"use client";

import { cn } from "@/lib/utils";

export function AnswerOption({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        selected
          ? "border-cyan-400/50 bg-cyan-400/15 text-foreground ring-2 ring-cyan-400/30"
          : "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {label}
    </button>
  );
}

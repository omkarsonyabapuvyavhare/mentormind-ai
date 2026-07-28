import * as Progress from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label = "Progress" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Progress.Root
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/10", className)}
      value={clamped}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <Progress.Indicator
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-transform duration-500"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </Progress.Root>
  );
}

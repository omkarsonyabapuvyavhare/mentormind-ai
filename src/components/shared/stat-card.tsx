import { GlassCard } from "@/components/ui/glass-card";
import { theme, type StatAccentKey } from "@/constants/theme";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: StatAccentKey;
  emphasized?: boolean;
}

export function StatCard({
  label,
  value,
  hint,
  accent = "cyan",
  emphasized = false,
}: StatCardProps) {
  return (
    <GlassCard className={emphasized ? theme.cards.highlight : undefined}>
      <p className="text-sm text-muted">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight", theme.statAccent[accent])}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </GlassCard>
  );
}

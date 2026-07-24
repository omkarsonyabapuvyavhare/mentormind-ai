import { GlassCard } from "@/components/ui/glass-card";

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <GlassCard className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 rounded bg-white/10" />
      ))}
    </GlassCard>
  );
}

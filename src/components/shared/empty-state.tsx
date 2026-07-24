import { GlassCard } from "@/components/ui/glass-card";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard className="text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {children}
    </GlassCard>
  );
}

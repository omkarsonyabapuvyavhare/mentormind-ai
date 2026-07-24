"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { theme } from "@/constants/theme";
import type { AccountabilityPartnerMessage } from "@/lib/ai/accountability-nudge";

const TEMPLATE_LABELS = {
  inactivity: "Accountability · Consistency",
  performance_recovery: "Accountability · Recovery",
  mastery_celebration: "Accountability · Momentum",
} as const;

export function AccountabilityPartnerCard({
  message,
  compact = false,
  onAction,
}: {
  message: AccountabilityPartnerMessage;
  compact?: boolean;
  onAction?: (message: AccountabilityPartnerMessage) => boolean | void;
}) {
  const router = useRouter();

  const cardClass =
    message.source === "welcome_back"
      ? theme.cards.success
      : message.templateId === "mastery_celebration"
        ? theme.cards.success
        : message.templateId === "performance_recovery"
          ? theme.cards.adaptation
          : "border-amber-400/20 bg-amber-400/10";

  const handlePrimaryClick = () => {
    const handled = onAction?.(message) === true;
    if (!handled) {
      router.push(message.action.href);
    }
  };

  return (
    <GlassCard className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {message.source === "welcome_back"
                ? "Accountability · Welcome back"
                : TEMPLATE_LABELS[message.templateId]}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{message.title}</h3>
          </div>
        </div>
        {message.source !== "welcome_back" ? (
          <Badge className="border-white/10 bg-white/5 capitalize">{message.severity}</Badge>
        ) : null}
      </div>

      <dl className={`mt-5 grid gap-3 ${compact ? "text-xs" : "text-sm"}`}>
        <PartnerRow icon={<Target className="h-3.5 w-3.5" />} label="Your goal" value={message.goal} />
        {message.templateId === "inactivity" && message.lastSeenLabel && message.weakTopicLabel ? (
          <>
            <PartnerRow label="Last seen" value={message.lastSeenLabel} />
            <PartnerRow label="Weak topic" value={message.weakTopicLabel} />
            <PartnerRow label="Reason" value={message.reasoning} />
          </>
        ) : (
          <>
            <PartnerRow label="Signal" value={message.signal} />
            <PartnerRow label="AI reasoning" value={message.reasoning} />
            <PartnerRow label="Recommended next action" value={message.action.label} emphasize />
          </>
        )}
      </dl>

      {!compact ? (
        <Button className="mt-6" onClick={handlePrimaryClick}>
          {message.action.label}
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </GlassCard>
  );
}

function PartnerRow({
  label,
  value,
  icon,
  emphasize = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
        {icon}
        {label}
      </dt>
      <dd className={`mt-1 leading-7 ${emphasize ? "font-medium" : ""}`}>{value}</dd>
    </div>
  );
}

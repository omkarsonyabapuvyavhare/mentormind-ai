"use client";

import { format } from "date-fns";

import { AccountabilityPartnerCard } from "@/components/shared/accountability-partner-card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { useInactivityPartnerAction } from "@/hooks/use-inactivity-partner-action";
import {
  buildAccountabilityPartnerMessage,
  classifyAccountabilityTemplate,
  selectActiveAccountabilityPartner,
} from "@/lib/ai/accountability-nudge";
import { selectLatestDecision, selectUnreadNudges } from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

export function NudgeFeed() {
  const state = useAppStore();
  const active = selectActiveAccountabilityPartner(state);
  const handlePartnerAction = useInactivityPartnerAction();
  const nudges = state.nudges;
  const unreadCount = selectUnreadNudges(state).length;
  const latestDecision = selectLatestDecision(state);

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Accountability partner</h3>
        <Badge className="border-white/10 bg-white/5 text-muted">{unreadCount} unread</Badge>
      </div>

      {active ? (
        <div className="mt-4">
          <AccountabilityPartnerCard message={active} onAction={handlePartnerAction} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Your mentor checks in after inactivity, weak scores, or mastery — always tied to your goal and next step.
        </p>
      )}

      {nudges.length > 1 ? (
        <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Previous check-ins</p>
          {[...nudges].reverse().slice(1).map((nudge) => {
            const template = classifyAccountabilityTemplate(state, nudge, latestDecision);
            if (!template) {
              return null;
            }
            const message = buildAccountabilityPartnerMessage(state, template, nudge, latestDecision);
            if (!message) {
              return null;
            }

            return (
              <li key={nudge.id}>
                <AccountabilityPartnerCard message={message} compact />
                <p className="mt-2 px-1 text-xs text-muted">{format(new Date(nudge.createdAt), "PP p")}</p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </GlassCard>
  );
}

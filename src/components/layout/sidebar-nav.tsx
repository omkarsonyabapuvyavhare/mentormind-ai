"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Map,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: routes.dashboard, label: "Home", icon: Sparkles, enabled: true },
  { href: routes.roadmap, label: "Learning Plan", icon: Map, enabled: true },
  { href: routes.mentor, label: "Ask Mentor", icon: BrainCircuit, enabled: true },
  { href: routes.profile, label: "Learning Twin", icon: UserRound, enabled: true },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2" aria-label="Main navigation">
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href === routes.dashboard && pathname.startsWith("/learn"));

        if (!item.enabled) {
          return (
            <div
              key={item.href}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-muted opacity-70"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <Badge className="border-white/10 bg-white/5 text-[10px] uppercase tracking-wide text-muted">
                Coming next
              </Badge>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
              active
                ? "bg-cyan-500/15 text-cyan-200"
                : "text-foreground hover:bg-white/5",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">MentorMind AI</p>
        <p className="text-xs text-muted">Your AI Tutor</p>
      </div>
    </div>
  );
}

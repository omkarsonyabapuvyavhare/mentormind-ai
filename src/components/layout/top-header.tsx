"use client";

import { SheetTrigger } from "@/components/ui/sheet";

export function TopHeader({
  title,
  subtitle,
  onOpenMobileNav,
}: {
  title: string;
  subtitle?: string;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Your AI Mentor</p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{subtitle ?? title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted md:text-base">{title}</p>
        ) : null}
      </div>
      <div className="lg:hidden">
        <SheetTrigger onClick={onOpenMobileNav} />
      </div>
    </header>
  );
}

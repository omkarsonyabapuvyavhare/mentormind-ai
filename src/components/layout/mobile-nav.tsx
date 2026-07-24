"use client";

import { SidebarBrand, SidebarNav } from "@/components/layout/sidebar-nav";

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close navigation overlay"
        onClick={() => onOpenChange(false)}
      />
      <aside className="glass-panel absolute inset-y-0 left-0 w-[85vw] max-w-xs p-6">
        <SidebarBrand />
        <SidebarNav onNavigate={() => onOpenChange(false)} />
      </aside>
    </div>
  );
}

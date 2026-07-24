"use client";

import { useState } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarBrand, SidebarNav } from "@/components/layout/sidebar-nav";
import { TopHeader } from "@/components/layout/top-header";
import { PageContainer } from "@/components/shared/page-container";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-white/10 bg-black/10 p-6 lg:block">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      <main className="px-4 py-6 md:px-8 md:py-8">
        <PageContainer>
          <TopHeader
            title={title}
            subtitle={subtitle}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <div className="section-stack">{children}</div>
        </PageContainer>
      </main>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useAppStore } from "@/stores/use-app-store";

const DEMO_ENTRY_TIMESTAMP = "2026-07-17T09:00:00.000Z";

export function StartLiveDemoButton({
  variant = "secondary",
  size = "lg",
  className,
}: {
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const enterDemoFromLanding = useAppStore((state) => state.enterDemoFromLanding);

  const handleClick = () => {
    enterDemoFromLanding(DEMO_ENTRY_TIMESTAMP);
    router.push(routes.dashboard);
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      Start live demo
    </Button>
  );
}

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/** @deprecated Legacy script entry — retained for unit tests only. */
import { StartLiveDemoButton } from "@/components/landing/start-live-demo-button";

const mockEnterDemoFromLanding = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: (
    selector: (state: { enterDemoFromLanding: typeof mockEnterDemoFromLanding }) => unknown,
  ) =>
    selector({
      enterDemoFromLanding: mockEnterDemoFromLanding,
    }),
}));

describe("StartLiveDemoButton (deprecated legacy entry)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("still invokes legacy script runner for backward-compatible tests", () => {
    render(<StartLiveDemoButton />);

    fireEvent.click(screen.getByRole("button", { name: "Start live demo" }));

    expect(mockEnterDemoFromLanding).toHaveBeenCalledWith("2026-07-17T09:00:00.000Z");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});

// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockSearchParams = vi.hoisted(() => ({
  value: "",
}));

const mockStoreState = vi.hoisted(() => ({
  presenterMode: true,
  syncPresenterMode: vi.fn((_search?: string, _source?: string) => mockStoreState.presenterMode),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(mockSearchParams.value),
}));

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: Object.assign(
    (selector?: (state: typeof mockStoreState) => unknown) =>
      selector ? selector(mockStoreState) : mockStoreState,
    { getState: () => mockStoreState },
  ),
}));

import { usePresenterModeBootstrap } from "@/hooks/use-presenter-mode";

describe("usePresenterModeBootstrap", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    mockSearchParams.value = "";
    mockStoreState.presenterMode = true;
    mockStoreState.syncPresenterMode.mockClear();
  });

  it("does not downgrade in-memory presenter mode when navigating without query params", () => {
    mockStoreState.presenterMode = true;
    mockSearchParams.value = "";

    renderHook(() => usePresenterModeBootstrap());

    expect(mockStoreState.syncPresenterMode).toHaveBeenCalledWith(undefined, "bootstrap:/dashboard");
    expect(mockStoreState.presenterMode).toBe(true);
  });

  it("syncs presenter mode from ?presenter=true on route change", () => {
    mockStoreState.presenterMode = false;
    mockSearchParams.value = "presenter=true";
    mockStoreState.syncPresenterMode.mockImplementation((search?: string) => {
      if (search?.includes("presenter=true")) {
        window.sessionStorage.setItem("mentormind-presenter-mode", "true");
        mockStoreState.presenterMode = true;
        return true;
      }
      return mockStoreState.presenterMode;
    });

    renderHook(() => usePresenterModeBootstrap());

    expect(mockStoreState.syncPresenterMode).toHaveBeenCalledWith(
      "?presenter=true",
      "bootstrap:/dashboard",
    );
    expect(window.sessionStorage.getItem("mentormind-presenter-mode")).toBe("true");
    expect(mockStoreState.presenterMode).toBe(true);
  });
});

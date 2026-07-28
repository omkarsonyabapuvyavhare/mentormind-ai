// @vitest-environment jsdom

import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoadmapHeader } from "@/components/roadmap/roadmap-header";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { useRoadmapCompletion } from "@/hooks/use-roadmap-completion";
import { useAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";

vi.mock("@/stores/use-app-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/stores/use-app-store")>();
  const store = actual.createTestAppStore();
  return {
    ...actual,
    useAppStore: store,
  };
});

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/roadmap/adaptation-diff-banner", () => ({
  AdaptationDiffBanner: () => null,
}));

vi.mock("@/components/roadmap/roadmap-changes-timeline", () => ({
  RoadmapChangesTimeline: () => null,
}));

vi.mock("@/components/shared/mentor-insight-card", () => ({
  MentorInsightCard: () => null,
}));

describe("useRoadmapCompletion stable subscription", () => {
  beforeEach(() => {
    useAppStore.getState().initializeDemoLearner(START);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns demo completion percentages unchanged", () => {
    const { result } = renderHook(() => useRoadmapCompletion());
    expect(result.current.percentage).toBe(69);
    expect(result.current.completedTasks).toBe(11);
    expect(result.current.totalTasks).toBe(16);
  });

  it("does not rerender when unrelated twin fields change", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useRoadmapCompletion();
    });

    expect(renderCount).toBe(1);
    const before = result.current;

    act(() => {
      useAppStore.setState((state) => ({
        twin: state.twin
          ? { ...state.twin, consistencyScore: state.twin.consistencyScore + 5 }
          : state.twin,
      }));
    });

    expect(renderCount).toBe(1);
    expect(result.current).toBe(before);
  });

  it("updates completion when task status changes", () => {
    const { result } = renderHook(() => useRoadmapCompletion());
    const pending = useAppStore
      .getState()
      .roadmap!.tasks.find((task) => task.status === "pending");

    expect(pending).toBeDefined();

    act(() => {
      useAppStore.setState((state) => ({
        roadmap: state.roadmap
          ? {
              ...state.roadmap,
              tasks: state.roadmap.tasks.map((task) =>
                task.id === pending!.id ? { ...task, status: "completed" as const } : task,
              ),
            }
          : state.roadmap,
      }));
    });

    expect(result.current.completedTasks).toBe(12);
    expect(result.current.percentage).toBe(75);
  });
});

describe("Roadmap completion UI regression", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    useAppStore.getState().initializeDemoLearner(START);
    consoleError.mockClear();
  });

  afterEach(() => {
    cleanup();
    consoleError.mockClear();
  });

  it("RoadmapHeader renders without getSnapshot warnings", () => {
    render(<RoadmapHeader />);

    expect(screen.getByText("69%")).toBeTruthy();
    expect(screen.getByText("11 of 16 tasks completed")).toBeTruthy();
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).includes("getSnapshot should be cached"),
      ),
    ).toBe(false);
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).includes("Maximum update depth exceeded"),
      ),
    ).toBe(false);
  });

  it("RoadmapView renders without infinite loop errors", () => {
    useAppStore.setState({
      isHydrated: true,
      isInitialized: true,
    });

    render(<RoadmapView />);

    expect(screen.getAllByText("Overall completion").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11 of 16 tasks completed").length).toBeGreaterThan(0);
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).includes("Maximum update depth exceeded"),
      ),
    ).toBe(false);
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoadmapHeader } from "@/components/roadmap/roadmap-header";
import type { LearningTask } from "@/types/roadmap";

const mockStoreState = vi.hoisted(() => ({
  twin: {
    goal: {
      title: "Learn Kubernetes in 8 weeks",
      targetDate: "2026-09-01T00:00:00.000Z",
      slug: "learn-kubernetes",
      category: "Cloud",
      type: "Skill" as const,
    },
  },
  roadmap: {
    id: "roadmap-1",
    goalId: "learn-kubernetes",
    version: 2,
    updatedAt: "2026-07-17T00:00:00.000Z",
    milestones: [],
    tasks: [] as LearningTask[],
  },
}));

vi.mock("@/stores/use-app-store", () => ({
  useAppStore: (selector?: (state: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

describe("RoadmapHeader completion display", () => {
  afterEach(() => {
    cleanup();
    mockStoreState.roadmap.tasks = [];
  });

  it("shows percentage, task count, and accessible progress bar", () => {
    mockStoreState.roadmap.tasks = [
      {
        id: "t1",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "lesson",
        title: "Cluster Architecture — Core Lesson",
        estimatedMinutes: 45,
        status: "completed",
        priority: 1,
        unlocked: true,
      },
      {
        id: "t2",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "quiz",
        title: "Cluster Architecture — Knowledge Check",
        estimatedMinutes: 20,
        status: "pending",
        priority: 2,
        unlocked: true,
      },
      {
        id: "t3",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "lab",
        title: "Cluster Architecture Lab",
        estimatedMinutes: 60,
        status: "pending",
        priority: 3,
        unlocked: true,
      },
      {
        id: "t4",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "revision",
        title: "Cluster Architecture Revision",
        estimatedMinutes: 30,
        status: "pending",
        priority: 4,
        unlocked: true,
      },
    ];

    render(<RoadmapHeader />);

    expect(screen.getByText("25%")).toBeTruthy();
    expect(screen.getByText("1 of 4 tasks completed")).toBeTruthy();

    const progressBar = screen.getByRole("progressbar", { name: "Overall roadmap completion" });
    expect(progressBar.getAttribute("aria-valuenow")).toBe("25");
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("updates displayed completion when tasks change", () => {
    mockStoreState.roadmap.tasks = [
      {
        id: "t1",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "lesson",
        title: "Lesson",
        estimatedMinutes: 45,
        status: "completed",
        priority: 1,
        unlocked: true,
      },
      {
        id: "t2",
        milestoneId: "ms-week-1",
        topicId: "cluster-architecture",
        type: "quiz",
        title: "Quiz",
        estimatedMinutes: 20,
        status: "completed",
        priority: 2,
        unlocked: true,
      },
      {
        id: "t3",
        milestoneId: "ms-week-1",
        topicId: "pods",
        type: "lesson",
        title: "Pods",
        estimatedMinutes: 45,
        status: "pending",
        priority: 3,
        unlocked: true,
      },
      {
        id: "t4",
        milestoneId: "ms-week-1",
        topicId: "pods",
        type: "quiz",
        title: "Pods Quiz",
        estimatedMinutes: 20,
        status: "pending",
        priority: 4,
        unlocked: true,
      },
    ];

    const { rerender } = render(<RoadmapHeader />);
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("2 of 4 tasks completed")).toBeTruthy();

    mockStoreState.roadmap.tasks = mockStoreState.roadmap.tasks.map((task) => ({
      ...task,
      status: "completed" as const,
    }));
    rerender(<RoadmapHeader />);

    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText("4 of 4 tasks completed")).toBeTruthy();
  });
});

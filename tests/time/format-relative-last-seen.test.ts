import { describe, expect, it } from "vitest";

import {
  formatRelativeLastSeen,
  formatSessionDuration,
  formatStudyDuration,
} from "@/lib/time/format-relative-last-seen";

describe("formatRelativeLastSeen", () => {
  it("returns Just now for sub-minute activity", () => {
    const now = new Date("2026-07-24T10:30:00.000Z");
    const lastActiveAt = "2026-07-24T10:29:30.000Z";

    expect(formatRelativeLastSeen(lastActiveAt, now)).toBe("Just now");
  });

  it("returns minutes ago within the same hour", () => {
    const now = new Date("2026-07-24T10:30:00.000Z");

    expect(formatRelativeLastSeen("2026-07-24T10:28:00.000Z", now)).toBe("2 minutes ago");
  });

  it("returns Today at for same-day activity", () => {
    const now = new Date(2026, 6, 24, 15, 0, 0);
    const lastActiveAt = new Date(2026, 6, 24, 10, 30, 0).toISOString();

    expect(formatRelativeLastSeen(lastActiveAt, now)).toBe("Today at 10:30 AM");
  });

  it("returns Yesterday for prior calendar day", () => {
    const now = new Date(2026, 6, 24, 10, 0, 0);
    const lastActiveAt = new Date(2026, 6, 23, 18, 0, 0).toISOString();

    expect(formatRelativeLastSeen(lastActiveAt, now)).toBe("Yesterday");
  });

  it("returns day count for recent inactivity", () => {
    const now = new Date(2026, 6, 24, 10, 0, 0);
    const lastActiveAt = new Date(2026, 6, 21, 10, 0, 0).toISOString();

    expect(formatRelativeLastSeen(lastActiveAt, now)).toBe("3 days ago");
  });
});

describe("formatSessionDuration", () => {
  it("formats mm:ss", () => {
    expect(formatSessionDuration(522)).toBe("08:42");
  });
});

describe("formatStudyDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatStudyDuration(18 * 60)).toBe("18h");
    expect(formatStudyDuration(125)).toBe("2h 5m");
  });
});

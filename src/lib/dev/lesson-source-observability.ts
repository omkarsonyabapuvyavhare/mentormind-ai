/**
 * Temporary development-only observability for lesson generation sources.
 * Never logs in production. Does not alter lesson content.
 */

export type LessonDisplaySource =
  | "Gemini"
  | "Lesson Cache"
  | "Deterministic Fallback"
  | "Emergency Fallback";

export type LessonOriginalSource = "ai" | "deterministic" | "emergency";

export interface LessonSourceReport {
  goalTitle: string;
  topicTitle: string;
  goalId?: string;
  topicId?: string;
  displaySource: LessonDisplaySource;
  originalSource?: LessonOriginalSource;
  cache: "HIT" | "MISS";
  reason?: string;
  generationTimeMs?: number;
}

const OBS_PREFIX = "mentormind-lesson-obs:v1:";

let lastServerFallbackPath: "deterministic" | "emergency" = "deterministic";

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function obsKey(goalId: string, topicId: string): string {
  return `${OBS_PREFIX}${goalId}:${topicId}`;
}

export function setServerLessonFallbackPath(path: "deterministic" | "emergency"): void {
  // Path marker is in-process only (used to label emergency vs mentor fallback).
  lastServerFallbackPath = path;
}

export function getServerLessonFallbackPath(): "deterministic" | "emergency" {
  return lastServerFallbackPath;
}

export function resetServerLessonFallbackPath(): void {
  lastServerFallbackPath = "deterministic";
}

export function originalSourceFromLessonSource(
  source: "ai" | "deterministic" | "cache",
  generationPath?: "deterministic" | "emergency",
): LessonOriginalSource | undefined {
  if (source === "ai") {
    return "ai";
  }
  if (source === "deterministic") {
    return generationPath === "emergency" ? "emergency" : "deterministic";
  }
  return undefined;
}

export function displaySourceFromOriginal(
  original: LessonOriginalSource | undefined,
): LessonDisplaySource {
  if (original === "ai") {
    return "Gemini";
  }
  if (original === "emergency") {
    return "Emergency Fallback";
  }
  return "Deterministic Fallback";
}

export function persistLessonSourceObservability(
  goalId: string,
  topicId: string,
  report: LessonSourceReport,
): void {
  if (!isDevelopment() || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      obsKey(goalId, topicId),
      JSON.stringify({
        ...report,
        recordedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function readLessonSourceObservability(
  goalId: string,
  topicId: string,
): LessonSourceReport | null {
  if (!isDevelopment() || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(obsKey(goalId, topicId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as LessonSourceReport;
  } catch {
    return null;
  }
}

export function logLessonSourceReport(report: LessonSourceReport): void {
  if (!isDevelopment()) {
    return;
  }

  const lines = [
    "----------------------------------------",
    "Lesson Source",
    "",
    `Goal:`,
    report.goalTitle,
    "",
    `Topic:`,
    report.topicTitle,
    "",
    `Source:`,
    report.displaySource,
  ];

  if (report.displaySource === "Lesson Cache" && report.originalSource) {
    lines.push("", "Original Source:", displaySourceFromOriginal(report.originalSource));
  }

  lines.push("", "Cache:", report.cache);

  if (report.reason) {
    lines.push("", "Reason:", report.reason);
  }

  if (typeof report.generationTimeMs === "number") {
    lines.push("", "Generation Time:", `${report.generationTimeMs} ms`);
  }

  lines.push("----------------------------------------");

  console.info(lines.join("\n"));
}

export function reportLessonSource(report: LessonSourceReport): void {
  logLessonSourceReport(report);

  if (report.goalId && report.topicId) {
    persistLessonSourceObservability(report.goalId, report.topicId, report);
  }
}

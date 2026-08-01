"use client";

import { useEffect, useState } from "react";

import {
  displaySourceFromOriginal,
  readLessonSourceObservability,
  type LessonDisplaySource,
  type LessonSourceReport,
} from "@/lib/dev/lesson-source-observability";
import { peekCachedLessonOriginalSource } from "@/lib/learn/lesson-session-cache";

function resolveBadgeLabel(
  lessonSource: "ai" | "deterministic" | "cache" | undefined,
  report: LessonSourceReport | null,
  originalFromCache: ReturnType<typeof peekCachedLessonOriginalSource>,
): LessonDisplaySource {
  if (report?.displaySource) {
    return report.displaySource;
  }

  if (lessonSource === "ai") {
    return displaySourceFromOriginal(report?.originalSource ?? "gemini");
  }

  if (lessonSource === "cache") {
    return "Lesson Cache";
  }

  if (originalFromCache === "kg" || report?.originalSource === "kg") {
    return "Knowledge Graph";
  }

  if (originalFromCache === "emergency" || report?.originalSource === "emergency") {
    return "Emergency Fallback";
  }

  return "Deterministic Fallback";
}

/**
 * Development-only badge showing where the rendered lesson came from.
 * Renders nothing in production builds.
 */
export function LessonSourceDevBadge({
  goalId,
  topicId,
  lessonSource,
}: {
  goalId?: string;
  topicId: string;
  lessonSource?: "ai" | "deterministic" | "cache";
}) {
  const [report, setReport] = useState<LessonSourceReport | null>(null);
  const [originalFromCache, setOriginalFromCache] = useState<
    ReturnType<typeof peekCachedLessonOriginalSource>
  >(undefined);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !goalId) {
      return;
    }

    setReport(readLessonSourceObservability(goalId, topicId));
    setOriginalFromCache(peekCachedLessonOriginalSource(goalId, topicId));
  }, [goalId, topicId, lessonSource]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const label = resolveBadgeLabel(lessonSource, report, originalFromCache);
  const original =
    report?.originalSource ??
    originalFromCache ??
    (lessonSource === "ai" ? "ai" : lessonSource === "deterministic" ? "deterministic" : undefined);

  return (
    <div
      className="mb-3 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
      data-testid="lesson-source-dev-badge"
    >
      <div className="font-semibold uppercase tracking-[0.14em] text-amber-200">Lesson Source</div>
      <div className="mt-1 text-sm font-medium text-amber-50">{label}</div>
      {label === "Lesson Cache" && original ? (
        <div className="mt-0.5 text-[11px] text-amber-100/80">
          Original: {displaySourceFromOriginal(original)}
        </div>
      ) : null}
      {report?.reason ? (
        <div className="mt-0.5 text-[11px] text-amber-100/70">Reason: {report.reason}</div>
      ) : null}
      {typeof report?.generationTimeMs === "number" ? (
        <div className="mt-0.5 text-[11px] text-amber-100/70">
          Generation Time: {report.generationTimeMs} ms
        </div>
      ) : null}
    </div>
  );
}

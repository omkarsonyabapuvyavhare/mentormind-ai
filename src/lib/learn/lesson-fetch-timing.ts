export interface LessonFetchTimingEvent {
  phase: string;
  atMs: number;
  topicId?: string;
  goalId?: string;
  detail?: string;
}

const timingEvents: LessonFetchTimingEvent[] = [];
let navigationStartMs: number | null = null;

function nowMs(): number {
  if (typeof performance !== "undefined") {
    return performance.now();
  }
  return Date.now();
}

export function recordLessonFetchTiming(
  phase: string,
  meta: { topicId?: string; goalId?: string; detail?: string } = {},
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const event: LessonFetchTimingEvent = {
    phase,
    atMs: nowMs(),
    ...meta,
  };

  timingEvents.push(event);
  console.info("[LessonFetch]", phase, meta.detail ?? "", meta);
}

export function recordStartLearningClick(topicId: string, goalId?: string): void {
  navigationStartMs = nowMs();
  recordLessonFetchTiming("start-learning-click", { topicId, goalId });
}

export function recordLessonRouteRender(topicId: string, goalId?: string): void {
  const detail =
    navigationStartMs !== null
      ? `+${Math.round(nowMs() - navigationStartMs)}ms since Start Learning`
      : undefined;

  recordLessonFetchTiming("lesson-route-render", { topicId, goalId, detail });
}

export function readLessonFetchTimings(): LessonFetchTimingEvent[] {
  return [...timingEvents];
}

export function resetLessonFetchTimingsForTests(): void {
  timingEvents.length = 0;
  navigationStartMs = null;
}

export function summarizeLessonFetchTimings(): Record<string, number | string | null> {
  const click = timingEvents.find((event) => event.phase === "start-learning-click");
  const render = timingEvents.find((event) => event.phase === "lesson-route-render");
  const cacheHit = timingEvents.find((event) => event.phase === "cache-hit");
  const apiStart = timingEvents.find((event) => event.phase === "api-request-start");
  const apiEnd = timingEvents.find((event) => event.phase === "api-request-end");
  const validated = timingEvents.find((event) => event.phase === "validation-complete");
  const prefetchStart = timingEvents.find((event) => event.phase === "prefetch-start");
  const prefetchComplete = timingEvents.find((event) => event.phase === "prefetch-complete");

  return {
    clickToRenderMs:
      click && render ? Math.round(render.atMs - click.atMs) : null,
    cacheLookupMs: cacheHit && apiStart ? Math.round(cacheHit.atMs - (prefetchStart?.atMs ?? click?.atMs ?? 0)) : null,
    apiDurationMs: apiStart && apiEnd ? Math.round(apiEnd.atMs - apiStart.atMs) : null,
    validationMs: apiEnd && validated ? Math.round(validated.atMs - apiEnd.atMs) : null,
    prefetchDurationMs:
      prefetchStart && prefetchComplete
        ? Math.round(prefetchComplete.atMs - prefetchStart.atMs)
        : null,
  };
}

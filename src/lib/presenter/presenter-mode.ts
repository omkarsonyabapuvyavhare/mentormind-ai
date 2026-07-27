const PRESENTER_SESSION_KEY = "mentormind-presenter-mode";

export function isPresenterModeEnabledByEnv(): boolean {
  return process.env.NEXT_PUBLIC_PRESENTER_MODE === "true";
}

export function readPresenterModeFromSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get("presenter") === "true";
}

export function readPersistedPresenterMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PRESENTER_SESSION_KEY) === "true";
}

export function persistPresenterMode(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  if (enabled) {
    window.sessionStorage.setItem(PRESENTER_SESSION_KEY, "true");
    return;
  }

  window.sessionStorage.removeItem(PRESENTER_SESSION_KEY);
}

export interface PresenterModeResolution {
  resolved: boolean;
  urlFlag: boolean;
  sessionFlag: boolean;
  storeFlag: boolean;
  envFlag: boolean;
}

export function resolvePresenterModeDetails(
  search?: string,
  storePresenterMode = false,
): PresenterModeResolution {
  const envFlag = isPresenterModeEnabledByEnv();
  const urlFlag = search ? readPresenterModeFromSearch(search) : false;
  const sessionFlag = readPersistedPresenterMode();
  const storeFlag = storePresenterMode;
  const resolved = envFlag || urlFlag || sessionFlag || storeFlag;

  return {
    resolved,
    urlFlag,
    sessionFlag,
    storeFlag,
    envFlag,
  };
}

/** Single source of truth: URL flag, sessionStorage, in-memory store, or env. */
export function resolvePresenterMode(search?: string, storePresenterMode = false): boolean {
  return resolvePresenterModeDetails(search, storePresenterMode).resolved;
}

/** Client-only bootstrap for store slices that may load in a separate bundle. */
export function readInitialPresenterMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const search = window.location.search || undefined;
  return resolvePresenterMode(search);
}

export function logPresenterModeTransition({
  pathname,
  source,
  storeBefore,
  storeAfter,
  resolution,
}: {
  pathname?: string;
  source: string;
  storeBefore: boolean;
  storeAfter: boolean;
  resolution: PresenterModeResolution;
}): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[PresenterMode]", {
    pathname:
      pathname ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    urlFlag: resolution.urlFlag,
    sessionFlag: resolution.sessionFlag,
    storeBefore,
    resolved: resolution.resolved,
    storeAfter,
    source,
  });
}

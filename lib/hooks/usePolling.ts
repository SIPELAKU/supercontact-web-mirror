// lib/hooks/usePolling.ts
"use client";

// Runs a refresh every few seconds - what TanStack's `refetchInterval` does for
// one query, for a refresh that is more than one query (useListRefresh's
// `reload`: refetch batch 1, then start the list over from it).
//
// It keeps the two rules TanStack's own polling keeps: a tick is skipped while
// the previous one is still running, so a slow network never stacks requests,
// and nothing runs while the browser tab is hidden.

import { useEffect, useRef } from "react";

export interface PollingOptions {
  /** Milliseconds between ticks; `false` or 0 is off. */
  intervalMs: number | false;
  tick: () => unknown;
  /** Defaults to the page's visibility. */
  isHidden?: () => boolean;
}

const pageIsHidden = () =>
  typeof document !== "undefined" && document.visibilityState === "hidden";

/** The framework-free core of usePolling. Returns the function that stops it. */
export function startPolling({ intervalMs, tick, isHidden = pageIsHidden }: PollingOptions) {
  if (!intervalMs) return () => {};
  let running = false;
  const id = setInterval(async () => {
    if (running || isHidden()) return;
    running = true;
    try {
      await tick();
    } catch {
      // The list shows its own error; the next tick simply tries again.
    } finally {
      running = false;
    }
  }, intervalMs);
  return () => clearInterval(id);
}

/** Calls `tick` every `intervalMs` while mounted; a new interval restarts the timer. */
export function usePolling(tick: () => unknown, intervalMs: number | false) {
  // The latest tick, so a new function each render does not restart the timer.
  const latest = useRef(tick);
  latest.current = tick;

  useEffect(
    () => startPolling({ intervalMs, tick: () => latest.current() }),
    [intervalMs]
  );
}

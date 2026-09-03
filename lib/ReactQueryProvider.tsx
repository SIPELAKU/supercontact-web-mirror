// lib/ReactQueryProvider.tsx
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The client was `new QueryClient()` with no options, which means TanStack's
 * own defaults: `staleTime: 0` and `refetchOnWindowFocus: true`. Every list in
 * the app therefore refetched on every alt-tab, and any in-flight interaction
 * on top of it (an open filter popover, a half-typed search) was racing a
 * refetch nobody asked for.
 *
 * That was survivable while every table showed ten rows at a time. It is not
 * survivable with lazy loading: a table you have scrolled through holds many
 * accumulated pages, and a focus-triggered refetch would re-fetch the page
 * you are standing on for no visible benefit.
 *
 * The values below are the ones the newer hooks (usePeople, useAgents, …)
 * already set by hand on each individual query - this just stops every new
 * query from having to remember.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Half a minute of "this is still good". Long enough that moving
        // between two screens does not refetch, short enough that a list is
        // never meaningfully stale when you come back to it.
        staleTime: 30_000,
        // Cache entries survive five minutes unmounted, so going into a
        // record and pressing back paints instantly instead of re-fetching.
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // A refetch on remount is still wanted - it is what makes a list
        // correct after a mutation elsewhere - but only once stale.
        refetchOnMount: true,
        refetchOnReconnect: true,
        // One retry, not three: a failing endpoint should surface its error
        // state to the user quickly rather than after ~7 seconds of silence.
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Created inside the component (via useState) rather than at module scope.
  // At module scope a single client is shared by every request the Node
  // process serves, so one user's cached list could be handed to the next.
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

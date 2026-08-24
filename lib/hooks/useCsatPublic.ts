// lib/hooks/useCsatPublic.ts
//
// TanStack Query hooks for the PUBLIC CSAT survey (app/(survey)/ route group).
// These never attach an Authorization header - the opaque token is the sole
// authority. A 404/410 (invalid/expired) is a terminal state, not a transient
// error, so the query does not retry it and the UI can render a clean neutral
// "no longer valid" message immediately.

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCsatSurvey,
  submitCsatSurvey,
  CsatApiError,
  type CsatSurvey,
  type CsatSubmitRequest,
} from "../api/csat-public";

const CSAT = "csat-public";

// Don't burn retries on a terminal 404/410 (invalid / expired token); keep the
// default retries for anything transient.
const noRetryOnTerminal = (failureCount: number, error: unknown) => {
  if (error instanceof CsatApiError && (error.status === 404 || error.status === 410)) {
    return false;
  }
  return failureCount < 2;
};

export function useCsatSurvey(token: string) {
  return useQuery<CsatSurvey, CsatApiError>({
    queryKey: [CSAT, token],
    queryFn: () => getCsatSurvey(token),
    enabled: !!token,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: noRetryOnTerminal,
  });
}

export function useSubmitCsatSurvey(token: string) {
  return useMutation<{ ok: true }, CsatApiError, CsatSubmitRequest>({
    mutationFn: (body) => submitCsatSurvey(token, body),
  });
}

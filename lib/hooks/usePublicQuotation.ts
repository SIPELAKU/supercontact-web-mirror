// lib/hooks/usePublicQuotation.ts
//
// TanStack Query hooks for the PUBLIC quotation acceptance page (the
// app/(quote)/ route group). Mirrors lib/hooks/useCsatPublic.ts.
//
// These never attach an Authorization header - the opaque 22-character
// `public_code` is the sole authority - and they run inside the (quote)
// group's OWN ReactQueryProvider, because React-Query providers do not cross
// route-group boundaries.
//
// A 404 (dead or unknown link) and a 409 (already decided) are TERMINAL
// states, not transient errors: retrying them shows the customer a spinner for
// several seconds before the same answer, and each retry burns one of the
// per-code rate-limit tokens (QUOTATION_CODE_LIMITS = 10/minute). So they are
// answered immediately and never retried.

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  acceptPublicQuotation,
  getPublicQuotation,
  QuotationPublicApiError,
  type PublicQuotation,
  type PublicQuotationAcceptRequest,
  type PublicQuotationAcceptResponse,
} from "../api/quotations-public";

const PUBLIC_QUOTATION = "public-quotation";

/** 404 = dead link (or unknown code - the API refuses to tell them apart),
 *  409 = already accepted/decided, 410 = expired. None is worth a retry. */
export function isTerminalPublicQuotationError(error: unknown): boolean {
  return (
    error instanceof QuotationPublicApiError &&
    (error.status === 404 || error.status === 409 || error.status === 410)
  );
}

const noRetryOnTerminal = (failureCount: number, error: unknown) => {
  if (isTerminalPublicQuotationError(error)) return false;
  return failureCount < 2;
};

export function usePublicQuotation(code: string) {
  return useQuery<PublicQuotation, QuotationPublicApiError>({
    queryKey: [PUBLIC_QUOTATION, code],
    queryFn: () => getPublicQuotation(code),
    enabled: !!code,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: noRetryOnTerminal,
  });
}

export function useAcceptPublicQuotation(code: string) {
  return useMutation<
    PublicQuotationAcceptResponse,
    QuotationPublicApiError,
    PublicQuotationAcceptRequest
  >({
    mutationFn: (body) => acceptPublicQuotation(code, body),
    // A failed accept must NOT retry either: the write is idempotent only in
    // the sense that the second attempt 409s, and a silent retry would turn a
    // clear "already accepted" into a confusing spinner.
    retry: false,
  });
}

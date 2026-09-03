// lib/hooks/useSelectedWaAccount.ts
"use client";

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Account } from '@/lib/types/omnichannel';

/** Query param carrying the selection. Distinct from everything useUrlSync owns. */
export const WA_ACCOUNT_PARAM = 'account';
const STORAGE_KEY = 'wa-templates:selected-account';

/**
 * Which WhatsApp sender a page is scoped to - remembered, never blank.
 *
 * WHY THIS EXISTS
 *
 * The template list held its sender in `useState('')`. Open a template, press
 * Back, and the component remounted with an empty selection: the query was
 * `enabled: !!accountId`, so it never fired, and the table sat empty behind a
 * dropdown nobody remembered they had to touch again. With one account an
 * effect auto-picked it; with two - which the dev tenant already has - it
 * happened on every round trip.
 *
 * WHY A SCOPE AND NOT A FILTER
 *
 * The list endpoint is not a plain list. It resolves ONE account, pulls that
 * subaccount's content from Twilio, and syncs it into the database - and a
 * company-wide fetch there once deleted every other account's templates as
 * "stale drift". So there is no "all senders" view to fall back to, and a
 * filter chip the user could clear would clear the table with it. The sender
 * is a scope: always resolved to something while any account exists.
 *
 * RESOLUTION ORDER
 *
 *   1. `?account=` in the URL  - survives Back, refresh, and a shared link
 *   2. last-used, in localStorage - a fresh visit lands where you left off
 *   3. the first account         - never an empty gate
 *
 * Whatever wins is written back to the URL, so the NEXT Back finds it there.
 * The URL is written with `replace`, not `push`: choosing a sender is not a
 * navigation and must not pile up history entries.
 */
export function useSelectedWaAccount(accounts: Account[] | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const list = accounts || [];
  const fromUrl = searchParams.get(WA_ACCOUNT_PARAM) || '';

  const accountId = useMemo(() => {
    if (list.length === 0) return '';
    const known = (id: string) => list.some((a) => a.id === id);

    if (fromUrl && known(fromUrl)) return fromUrl;

    let remembered = '';
    try {
      remembered = window.localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      // Storage can be unavailable (private mode, blocked site data). The
      // selection still resolves - it just does not survive a fresh visit.
    }
    if (remembered && known(remembered)) return remembered;

    return list[0].id;
    // `list` is derived from `accounts`; comparing the array identity is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, fromUrl]);

  const writeUrl = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(WA_ACCOUNT_PARAM) === id) return;
      params.set(WA_ACCOUNT_PARAM, id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Whatever resolved - URL, memory, or default - belongs in the URL, or the
  // next Back navigation loses it again. Only runs once accounts have loaded,
  // because before that there is nothing valid to write.
  useEffect(() => {
    if (accountId) writeUrl(accountId);
  }, [accountId, writeUrl]);

  const setAccountId = useCallback(
    (id: string) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, id);
      } catch {
        // Best effort; the URL still carries it.
      }
      writeUrl(id);
    },
    [writeUrl]
  );

  return { accountId, setAccountId, accounts: list };
}

/** The list URL scoped to a sender - for Back links from detail and create. */
export function templatesListHref(accountId?: string | null): string {
  const base = '/whatsapp-marketing/template-broadcasting';
  return accountId ? `${base}?${WA_ACCOUNT_PARAM}=${encodeURIComponent(accountId)}` : base;
}

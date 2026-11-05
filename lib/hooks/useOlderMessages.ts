// lib/hooks/useOlderMessages.ts
"use client";

// FE-8: the pages before the newest one, for one conversation. Page 1 stays
// with useConversation (the WebSocket and the safety poll reload it); this
// keeps pages 2, 3, ... so a reload of page 1 never drops what the staff
// already scrolled up to. Everything resets when the conversation changes.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchConversation } from "@/lib/api/omnichannel";
import type { Message } from "@/lib/types/omnichannel";
import {
  CONVERSATION_PAGE_SIZE,
  hasOlderMessages,
  mergeConversationMessages,
} from "@/lib/utils/conversationMessages";

interface OlderPages {
  conversationId: string | null;
  pages: Message[][];
  // The API answered an empty page: nothing older, whatever the total says.
  exhausted: boolean;
  failed: boolean;
}

// One empty list, so a memo depending on it does not rerun every render.
const NO_PAGES: Message[][] = [];

const empty = (conversationId: string | null): OlderPages => ({
  conversationId,
  pages: NO_PAGES,
  exhausted: false,
  failed: false,
});

export function useOlderMessages(conversationId: string | null | undefined) {
  const { token } = useAuth();
  const id = conversationId ?? null;
  const [state, setState] = useState<OlderPages>(() => empty(id));
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  // The latest state for the async loader.
  const stateRef = useRef(state);
  stateRef.current = state;
  // Goes up with every conversation: an answer for an earlier one is ignored.
  const generationRef = useRef(0);
  // One page at a time.
  const loadingRef = useRef(false);

  // Another conversation: drop the old pages; the new one may load at once,
  // even while an answer for the previous one is still on its way.
  useEffect(() => {
    generationRef.current += 1;
    loadingRef.current = false;
    setState(empty(id));
    setIsLoadingOlder(false);
  }, [id]);

  const loadOlder = useCallback(async () => {
    const current = stateRef.current;
    if (!token || !id || current.conversationId !== id || current.exhausted || loadingRef.current) return;
    const generation = generationRef.current;
    loadingRef.current = true;
    setIsLoadingOlder(true);
    setState((prev) => ({ ...prev, failed: false }));
    try {
      const data = await fetchConversation(token, id, {
        page: current.pages.length + 2,
        limit: CONVERSATION_PAGE_SIZE,
      });
      if (generation !== generationRef.current) return; // the conversation changed meanwhile
      const messages = data.messages ?? [];
      setState((prev) => ({ ...prev, pages: [...prev.pages, messages], exhausted: messages.length === 0 }));
    } catch {
      if (generation !== generationRef.current) return;
      setState((prev) => ({ ...prev, failed: true }));
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setIsLoadingOlder(false);
      }
    }
  }, [token, id]);

  const own = state.conversationId === id;
  return {
    olderPages: own ? state.pages : NO_PAGES,
    exhausted: own && state.exhausted,
    failed: own && state.failed,
    isLoadingOlder,
    loadOlder,
  };
}

/**
 * Everything a thread shows for one conversation: the newest page, the older
 * pages loaded so far, and every message shown before. Page 1 is a sliding
 * window: when a new message arrives it drops its oldest one, which an older
 * page loaded earlier may not hold. Remembering what was shown keeps that
 * message on screen (FE-8: loaded messages never disappear on a reload).
 */
export function useConversationMessages(
  conversationId: string | null | undefined,
  newestPage: Message[] | undefined,
  totalMessages: number | undefined,
) {
  const older = useOlderMessages(conversationId);
  const id = conversationId ?? null;
  const shownRef = useRef<{ conversationId: string | null; messages: Message[] }>({ conversationId: null, messages: [] });

  const messages = useMemo(() => {
    const retained = shownRef.current.conversationId === id ? shownRef.current.messages : [];
    // Later sets win a duplicate: older pages over what was shown, page 1 over all.
    const merged = mergeConversationMessages(newestPage ?? [], [retained, ...older.olderPages]);
    shownRef.current = { conversationId: id, messages: merged };
    return merged;
  }, [id, newestPage, older.olderPages]);

  return {
    messages,
    hasOlder: !older.exhausted && hasOlderMessages(messages.length, totalMessages),
    loadOlder: older.loadOlder,
    isLoadingOlder: older.isLoadingOlder,
    loadOlderFailed: older.failed,
  };
}

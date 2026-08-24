"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { postConversationTyping } from "@/lib/api/omnichannel";

// Ephemeral, module-level store for VISITOR-typing signals arriving over the
// omnichannel WS (see useOmnichannelRealtime's `visitor_typing` branch). Kept
// out of the TanStack Query cache on purpose - typing is transient presence,
// not conversation data. Each signal lights the indicator for ~4s; a fresh
// signal resets that window, and the entry auto-clears once the window lapses.
const VISITOR_TYPING_TTL_MS = 4000;

// conversationId -> expiry timestamp (ms). Presence-only; never persisted.
const typingUntil = new Map<string, number>();
const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

// Record that the visitor on `conversationId` is typing, (re)opening the ~4s
// window. Called from the WS hook on each `visitor_typing` push.
export function markVisitorTyping(conversationId: string) {
  if (!conversationId) return;
  typingUntil.set(conversationId, Date.now() + VISITOR_TYPING_TTL_MS);

  const existing = expiryTimers.get(conversationId);
  if (existing) clearTimeout(existing);
  expiryTimers.set(
    conversationId,
    setTimeout(() => {
      typingUntil.delete(conversationId);
      expiryTimers.delete(conversationId);
      emit();
    }, VISITOR_TYPING_TTL_MS)
  );

  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isTypingNow(conversationId: string | null | undefined): boolean {
  if (!conversationId) return false;
  const until = typingUntil.get(conversationId);
  return until !== undefined && until > Date.now();
}

// Subscribe an open-conversation view to the visitor-typing store. Returns true
// while a visitor-typing signal for `conversationId` is still inside its ~4s
// window, and re-renders back to false when the window lapses.
export function useConversationTyping(conversationId: string | null | undefined): boolean {
  const getSnapshot = useCallback(() => isTypingNow(conversationId), [conversationId]);
  // Server snapshot is always false - typing presence only exists client-side.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

// Agent-side typing emitter. Returns a best-effort `notify()` the composers call
// on every input change; it throttles to at most one POST per ~2s so a busy
// composer doesn't spam the endpoint, while still keeping the visitor's "agent
// is typing" indicator alive as the agent keeps typing. No-ops without a
// conversation id and swallows all errors (presence is never worth a toast).
const AGENT_TYPING_THROTTLE_MS = 2000;

export function useAgentTypingSignal(conversationId: string | null | undefined): () => void {
  const { getToken } = useAuth();
  const conversationIdRef = useRef(conversationId);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    // Reset the throttle on switch so the first keystroke in the newly opened
    // conversation always emits, even right after typing in another one.
    lastSentAtRef.current = 0;
  }, [conversationId]);

  return useCallback(() => {
    const currentConversationId = conversationIdRef.current;
    if (!currentConversationId) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < AGENT_TYPING_THROTTLE_MS) return;
    lastSentAtRef.current = now;

    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await postConversationTyping(token, currentConversationId);
      } catch {
        // best-effort presence signal - never surface an error
      }
    })();
  }, [getToken]);
}

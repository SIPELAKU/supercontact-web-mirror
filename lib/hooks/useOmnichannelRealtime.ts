"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserIdFromToken } from "@/lib/utils/jwt";
import {
  Conversation,
  ConversationWithMessages,
  OmnichannelContact,
  OmnichannelContactsResponse,
} from "@/lib/types/omnichannel";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

// Trailing debounce for the broader inbox-list consistency backstop, so a
// busy inbox doesn't refetch on every single push - the targeted
// setQueriesData patch above already keeps the visible list responsive in
// the meantime.
const BACKSTOP_INVALIDATE_DELAY_MS = 2500;

interface OmnichannelConversationUpdatedPayload {
  inbox_key?: string;
  contact_id?: string;
  conversation_id?: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count?: number;
  // Support Desk Phase 0: status/priority mutations reuse this push, tagged
  // with `reason` "status_changed" / "priority_changed" and carrying the new
  // value so the open conversation can be patched optimistically.
  reason?: string;
  status?: Conversation["status"];
  priority?: Conversation["priority"];
}

/**
 * Page-scoped real-time hook for the Omnichannel inbox. Mount only while
 * `/omnichannel` is open (unlike NotificationsContext, which owns one
 * permanent app-shell connection for the whole session).
 *
 * Opens its own connection to the same generic per-user WS endpoint
 * NotificationsContext already uses (the backend allows up to 5 concurrent
 * connections per user, and NotificationsContext already proves a second,
 * independent connection to this endpoint works cleanly). Modeled closely
 * on NotificationsContext.tsx's connect/reconnect-with-backoff logic.
 *
 * On `omnichannel_conversation_updated` pushes it patches the cached
 * contacts list in place (bulk partial-key match via setQueriesData, since
 * the real cache key is parameterized by the current search term) and, if
 * the push is for the conversation currently open, invalidates that
 * conversation's query to pull fresh messages. A debounced broader
 * inbox-list invalidation runs as a consistency backstop.
 */
export function useOmnichannelRealtime(activeConversationId: string | undefined): boolean {
  const { getToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const closedByUsRef = useRef(false);
  const backstopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  // Kept in a ref (not a dep) so the WS effect below doesn't tear down and
  // reconnect every time the user opens a different conversation.
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const scheduleBackstopInvalidate = () => {
      if (backstopTimerRef.current) clearTimeout(backstopTimerRef.current);
      backstopTimerRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["omnichannels", "inbox", "contacts"] });
      }, BACKSTOP_INVALIDATE_DELAY_MS);
    };

    const handleConversationUpdated = (data: OmnichannelConversationUpdatedPayload) => {
      queryClient.setQueriesData<OmnichannelContactsResponse | undefined>(
        { queryKey: ["omnichannels", "inbox", "contacts"] },
        (old) => {
          if (!old) return old;
          const idx = old.contacts.findIndex(
            (c) =>
              (data.inbox_key && c.inbox_key === data.inbox_key) ||
              (data.contact_id && c.contact_id === data.contact_id)
          );
          if (idx === -1) return old;

          const patched: OmnichannelContact = {
            ...old.contacts[idx],
            ...(data.last_message_at !== undefined && { last_message_at: data.last_message_at }),
            ...(data.last_message_preview !== undefined && {
              last_message_preview: data.last_message_preview,
            }),
            ...(data.unread_count !== undefined && { unread_count: data.unread_count }),
          };

          const nextContacts = [...old.contacts];
          nextContacts.splice(idx, 1);
          nextContacts.unshift(patched);

          return { ...old, contacts: nextContacts };
        }
      );

      if (
        data.conversation_id &&
        activeConversationIdRef.current &&
        data.conversation_id === activeConversationIdRef.current
      ) {
        // status_changed / priority_changed carry the new value - patch the
        // open conversation's cached record so the detail sidebar reflects it
        // instantly, ahead of the invalidate below that pulls the authoritative
        // record. (All other reasons just invalidate, as before.)
        if (data.status !== undefined || data.priority !== undefined) {
          queryClient.setQueryData<ConversationWithMessages | undefined>(
            ["omnichannels", "conversations", activeConversationIdRef.current],
            (old) =>
              old
                ? {
                    ...old,
                    ...(data.status !== undefined && { status: data.status }),
                    ...(data.priority !== undefined && { priority: data.priority }),
                  }
                : old
          );
        }

        queryClient.invalidateQueries({
          queryKey: ["omnichannels", "conversations", activeConversationIdRef.current],
        });
      }

      scheduleBackstopInvalidate();
    };

    const connect = async () => {
      let token: string;
      try {
        token = await getToken();
      } catch {
        return;
      }
      if (cancelled) return;

      const userId = getUserIdFromToken(token);
      if (!userId) return;

      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      const wsUrl = `${wsBaseUrl}/chat/ws/chat/${userId}?token=${token}`;

      closedByUsRef.current = false;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "omnichannel_conversation_updated") {
            handleConversationUpdated(data.data || {});
          }
        } catch (e) {
          console.error("[Omnichannel WS] Parse error", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (closedByUsRef.current || cancelled) return;
        const attempt = reconnectAttemptRef.current + 1;
        reconnectAttemptRef.current = attempt;
        const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** (attempt - 1), RECONNECT_MAX_DELAY_MS);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        wsRef.current?.readyState !== WebSocket.OPEN &&
        wsRef.current?.readyState !== WebSocket.CONNECTING
      ) {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectAttemptRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (backstopTimerRef.current) clearTimeout(backstopTimerRef.current);
      closedByUsRef.current = true;
      wsRef.current?.close();
    };
  }, [isAuthenticated, getToken, queryClient]);

  return connected;
}

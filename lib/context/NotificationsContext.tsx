"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/utils/jwt";

interface NotificationsContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  // Bumped on every real-time "notification" push - components that render a
  // notification list (the dropdown, the full page) can watch this to know
  // it's worth refetching their own list while open, without this context
  // needing to own that list itself.
  lastPushAt: number | null;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastPushAt, setLastPushAt] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const closedByUsRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      const res = await fetchUnreadCount(token);
      if (res.success) setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  }, [isAuthenticated, getToken]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        const token = await getToken();
        const res = await markNotificationAsRead(token, id);
        if (res.success) setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        throw err;
      }
    },
    [getToken]
  );

  const markAllRead = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await markAllNotificationsAsRead(token);
      if (res.success) setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      throw err;
    }
  }, [getToken]);

  // Initial load + refetch on tab focus/visibility, matching the pattern
  // already established in AuthContext.tsx rather than a setInterval poll.
  useEffect(() => {
    refreshUnreadCount();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshUnreadCount();
    };
    const handleFocus = () => refreshUnreadCount();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshUnreadCount]);

  // Real-time push: a second, lightweight, app-shell-scoped connection to
  // the same generic per-user WS endpoint useChat.ts already uses (backend
  // supports up to 5 concurrent connections per user) - kept fully separate
  // from useChat.ts so this hook never has to reason about chat's raw
  // untyped message frames, and vice versa. Unlike useChat.ts (page-scoped,
  // remounts naturally), this connection lives for the whole session, so it
  // needs its own reconnect-with-backoff.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

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
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "notification") {
            setUnreadCount((prev) => prev + 1);
            setLastPushAt(Date.now());
          } else if (data.type === "notifications_refresh") {
            const nextCount = data.data?.unread_count;
            if (typeof nextCount === "number") setUnreadCount(nextCount);
            setLastPushAt(Date.now());
          }
        } catch (e) {
          console.error("[Notifications WS] Parse error", e);
        }
      };

      ws.onclose = () => {
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
      closedByUsRef.current = true;
      wsRef.current?.close();
    };
  }, [isAuthenticated, getToken]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount, markRead, markAllRead, lastPushAt }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}

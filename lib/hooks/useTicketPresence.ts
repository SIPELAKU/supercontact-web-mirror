import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { sendTicketViewerHeartbeat, fetchTicketViewers, TicketViewer } from "@/lib/api/tickets";

const HEARTBEAT_INTERVAL_MS = 20000;

// F11: heartbeat-polling presence, not a WebSocket subscription - see the
// Phase 2 plan for why (avoids refactoring the chat-only ConnectionManager
// and its single global socket in useChat.ts).
export function useTicketPresence(ticketId: string) {
    const { getToken } = useAuth();
    const [viewers, setViewers] = useState<TicketViewer[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!ticketId) return;
        let cancelled = false;

        const tick = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                await sendTicketViewerHeartbeat(token, ticketId);
                const res = await fetchTicketViewers(token, ticketId);
                if (!cancelled) setViewers(res.data.data || []);
            } catch {
                // presence is best-effort, never surface an error toast for it
            }
        };

        tick();
        intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);

        return () => {
            cancelled = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [ticketId, getToken]);

    return { viewers };
}

"use client";

import { useTicketPresence } from "@/lib/hooks/useTicketPresence";

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

interface TicketViewersIndicatorProps {
    ticketId: string;
}

export function TicketViewersIndicator({ ticketId }: TicketViewersIndicatorProps) {
    const { viewers } = useTicketPresence(ticketId);

    if (viewers.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5" title={viewers.map((v) => v.user.fullname).join(", ")}>
            <div className="flex -space-x-2">
                {viewers.slice(0, 4).map((v) => (
                    <div
                        key={v.user.id}
                        className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-semibold ring-2 ring-white"
                    >
                        {getInitials(v.user.fullname)}
                    </div>
                ))}
            </div>
            <span className="text-xs text-gray-500">
                {viewers.length === 1
                    ? `${viewers[0].user.fullname} is also viewing`
                    : `${viewers.length} others viewing`}
            </span>
        </div>
    );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { TicketSlaSummary } from "@/lib/types/Ticket";
import { useCountdown } from "@/lib/hooks/useCountdown";

interface TicketSlaBadgeProps {
    sla?: TicketSlaSummary | null;
}

const APPROACHING_THRESHOLD_MS = 30 * 60 * 1000;

export function TicketSlaBadge({ sla }: TicketSlaBadgeProps) {
    const activeTarget = !sla
        ? null
        : !sla.first_response_met_at
            ? {
                label: "First Response",
                dueAt: sla.first_response_due_at,
                breached: sla.first_response_breached,
            }
            : !sla.resolution_met_at
                ? {
                    label: "Resolution",
                    dueAt: sla.resolution_due_at,
                    breached: sla.resolution_breached,
                }
                : null;

    const countdown = useCountdown(activeTarget?.dueAt);

    if (!sla || !sla.policy_id) return null;

    if (!activeTarget) {
        return (
            <Badge
                className="rounded-full px-3 py-1 font-medium bg-green-100 text-green-700 hover:bg-green-200 border-none"
                variant="secondary"
            >
                SLA Met
            </Badge>
        );
    }

    const isBreached = activeTarget.breached || !!countdown?.isPast;
    const isApproaching =
        !isBreached && activeTarget.dueAt
            ? new Date(activeTarget.dueAt).getTime() - Date.now() <= APPROACHING_THRESHOLD_MS
            : false;

    const className = isBreached
        ? "bg-red-100 text-red-700 hover:bg-red-200 border-none"
        : isApproaching
            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-none";

    return (
        <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
            {activeTarget.label}: {isBreached ? "Breached" : countdown?.label || "-"}
        </Badge>
    );
}

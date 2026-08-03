import { useEffect, useRef, useState } from "react";
import { intervalToDuration } from "date-fns";

interface CountdownResult {
    label: string;
    isPast: boolean;
}

function formatDuration(ms: number): string {
    const duration = intervalToDuration({ start: 0, end: Math.abs(ms) });
    const parts: string[] = [];
    if (duration.days) parts.push(`${duration.days}d`);
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    if (!parts.length) parts.push(`${duration.seconds || 0}s`);
    return parts.slice(0, 2).join(" ");
}

// Live-ticking "time until/since" label for an SLA due date - mirrors
// useChat.ts's setInterval-driven recording-timer idiom.
export function useCountdown(targetIso?: string | null): CountdownResult | null {
    const [now, setNow] = useState(() => Date.now());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!targetIso) return;
        intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [targetIso]);

    if (!targetIso) return null;

    const target = new Date(targetIso).getTime();
    const diff = target - now;
    const isPast = diff <= 0;

    return {
        label: isPast ? `Overdue by ${formatDuration(diff)}` : `${formatDuration(diff)} left`,
        isPast,
    };
}

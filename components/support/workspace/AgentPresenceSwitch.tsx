"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useMyPresence, useSetMyPresence } from "@/lib/hooks/useAgents";
import type { AgentPresenceStatus } from "@/lib/types/agents";

// Segmented Online / Away / Offline control bound to the signed-in agent's
// presence. A coloured dot per state (green / amber / grey) mirrors the queue
// rows' status dots. Backed by useMyPresence + useSetMyPresence (optimistic).
const PRESENCE_OPTIONS: {
  value: AgentPresenceStatus;
  label: string;
  dot: string;
  activeText: string;
}[] = [
  { value: "online", label: "Online", dot: "bg-emerald-500", activeText: "text-emerald-600" },
  { value: "away", label: "Away", dot: "bg-amber-500", activeText: "text-amber-600" },
  { value: "offline", label: "Offline", dot: "bg-gray-400", activeText: "text-gray-600" },
];

export function AgentPresenceSwitch() {
  const { data: profile, isLoading, isError } = useMyPresence();
  const setPresence = useSetMyPresence();

  // Default to "offline" until we know better so no state looks selected by
  // accident before the profile loads.
  const current: AgentPresenceStatus = profile?.presence_status ?? "offline";
  const disabled = isLoading || isError;

  const handleSelect = (status: AgentPresenceStatus) => {
    if (status === current || setPresence.isPending) return;
    setPresence.mutate(status, {
      onError: (error) =>
        notify.error("Error", { description: handleError(error, "Set presence") }),
    });
  };

  return (
    <div
      className="mt-3 flex gap-1 rounded-[10px] border border-gray-200 bg-gray-50 p-[3px]"
      role="group"
      aria-label="Your availability"
    >
      {PRESENCE_OPTIONS.map((opt) => {
        const isActive = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            disabled={disabled}
            aria-pressed={isActive}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-1 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? cn("bg-white shadow-sm", opt.activeText)
                : "text-gray-400 hover:text-gray-600",
              disabled && "cursor-wait opacity-70"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? opt.dot : "bg-current")} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

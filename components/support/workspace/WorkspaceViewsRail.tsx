"use client";

import React from "react";
import { CheckCheck, Zap, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationWithMessages } from "@/lib/types/omnichannel";
import { WORKSPACE_VIEWS, WorkspaceView, WorkspaceViewId } from "./workspaceViews";
import { AgentPresenceSwitch } from "./AgentPresenceSwitch";
import { ClaimNextControl } from "./ClaimNextControl";

const VIEW_ICONS: Record<WorkspaceViewId, React.ElementType> = {
  assigned_to_me: CheckCheck,
  live_unassigned: Zap,
  all_open: ListChecks,
  solved: CheckCircle2,
  snoozed: Clock,
};

// Fixed group order so "My work" always renders above "Team queues".
const GROUP_ORDER = ["My work", "Team queues"];

interface WorkspaceViewsRailProps {
  activeViewId: WorkspaceViewId;
  onSelectView: (view: WorkspaceView) => void;
  // Row count for the currently active view only (from the list `total`).
  // Other views intentionally show no number rather than a fake one.
  activeTotal?: number;
  isLoading?: boolean;
  // Invoked when the agent claims the next conversation from a queue - the
  // workspace selects the returned conversation.
  onConversationClaimed: (conversation: ConversationWithMessages) => void;
}

// Left rail: live agent presence switch + the view presets (grouped) + a
// "claim next" queue puller in the footer. Collapses below `lg` (see
// WorkspaceClient's grid).
export function WorkspaceViewsRail({
  activeViewId,
  onSelectView,
  activeTotal,
  isLoading,
  onConversationClaimed,
}: WorkspaceViewsRailProps) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    views: WORKSPACE_VIEWS.filter((v) => v.group === group),
  })).filter((g) => g.views.length > 0);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="px-4 pb-3 pt-4">
        <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Workspace</h1>

        {/* Live agent presence switch (Phase 4a). */}
        <AgentPresenceSwitch />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4" aria-label="Conversation views">
        {grouped.map(({ group, views }) => (
          <div key={group}>
            <div className="px-2 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
              {group}
            </div>
            {views.map((view) => {
              const Icon = VIEW_ICONS[view.id];
              const isActive = view.id === activeViewId;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onSelectView(view)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#EEF2FD] font-bold text-[#3E63D8]"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0",
                      isActive ? "text-[#5479EE]" : view.live ? "text-red-500" : "text-gray-400"
                    )}
                  />
                  <span className="flex-1 truncate">{view.label}</span>
                  {isActive && (
                    <span
                      className={cn(
                        "min-w-[24px] rounded-full px-2 py-0.5 text-center text-xs font-semibold",
                        "bg-[#E1E8FC] text-[#3E63D8]"
                      )}
                    >
                      {isLoading ? "…" : (activeTotal ?? 0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Claim-next queue puller (Phase 4a). */}
      <ClaimNextControl onClaimed={onConversationClaimed} />
    </aside>
  );
}

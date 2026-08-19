"use client";

import React from "react";
import { Tooltip } from "@mui/material";
import { CheckCheck, Zap, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKSPACE_VIEWS, WorkspaceView, WorkspaceViewId } from "./workspaceViews";

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
}

// Left rail: agent presence switch (disabled - Coming soon) + the view
// presets, grouped. Collapses below `lg` (see WorkspaceClient's grid).
export function WorkspaceViewsRail({
  activeViewId,
  onSelectView,
  activeTotal,
  isLoading,
}: WorkspaceViewsRailProps) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    views: WORKSPACE_VIEWS.filter((v) => v.group === group),
  })).filter((g) => g.views.length > 0);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="px-4 pb-3 pt-4">
        <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Workspace</h1>

        {/* Agent presence switch - render but DISABLED (no presence backend yet).
            TODO(Support Desk Phase 2): wire Online/Away/Offline to an agent
            presence service and reflect it on the queue rows' status dots. */}
        <Tooltip title="Coming soon" placement="bottom" arrow>
          <div
            className="mt-3 flex cursor-not-allowed gap-1 rounded-[10px] border border-gray-200 bg-gray-50 p-[3px] opacity-60"
            aria-disabled="true"
          >
            {(["Online", "Away", "Offline"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                disabled
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-1 py-1.5 text-xs font-semibold",
                  i === 0 ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    i === 0 ? "bg-emerald-500" : "bg-current"
                  )}
                />
                {label}
              </button>
            ))}
          </div>
        </Tooltip>
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
    </aside>
  );
}

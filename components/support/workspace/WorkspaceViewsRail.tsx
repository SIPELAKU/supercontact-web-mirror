"use client";

import React, { useState } from "react";
import {
  CheckCheck,
  Zap,
  ListChecks,
  CheckCircle2,
  Clock,
  Bookmark,
  Plus,
  Trash2,
  Users,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ConversationWithMessages,
  SavedView,
  SavedViewFilters,
} from "@/lib/types/omnichannel";
import {
  useSavedViews,
  useCreateSavedView,
  useDeleteSavedView,
} from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import {
  WORKSPACE_VIEWS,
  WorkspaceView,
  WorkspaceViewId,
  WorkspaceActiveId,
  toSavedViewSelectionId,
} from "./workspaceViews";
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
  activeViewId: WorkspaceActiveId;
  onSelectView: (view: WorkspaceView) => void;
  // Selecting a custom (persisted) saved view - applies ALL of its filters.
  onSelectSavedView: (view: SavedView) => void;
  // The current queue filter state, projected into the saved-view shape, so the
  // "Save current view" dialog can persist exactly what's on screen.
  currentFilters: SavedViewFilters;
  // Row count for the currently active view only (from the list `total`).
  // Other views intentionally show no number rather than a fake one.
  activeTotal?: number;
  isLoading?: boolean;
  // Invoked when the agent claims the next conversation from a queue - the
  // workspace selects the returned conversation.
  onConversationClaimed: (conversation: ConversationWithMessages) => void;
}

// Left rail: live agent presence switch + the view presets (built-in +
// custom/saved) + a "save current view" affordance and a "claim next" queue
// puller in the footer. Collapses below `lg` (see WorkspaceClient's grid).
export function WorkspaceViewsRail({
  activeViewId,
  onSelectView,
  onSelectSavedView,
  currentFilters,
  activeTotal,
  isLoading,
  onConversationClaimed,
}: WorkspaceViewsRailProps) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    views: WORKSPACE_VIEWS.filter((v) => v.group === group),
  })).filter((g) => g.views.length > 0);

  const { data: savedViews = [], isLoading: isLoadingSaved } = useSavedViews("conversation");
  const deleteMutation = useDeleteSavedView();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const [saveOpen, setSaveOpen] = useState(false);

  const handleDelete = (view: SavedView) => {
    confirm({
      title: "Delete saved view",
      description: (
        <>
          Delete the saved view <span className="font-semibold">“{view.name}”</span>? This can&apos;t be
          undone.
        </>
      ),
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(view.id);
          notify.success("Saved view deleted");
        } catch (error) {
          notify.error("Error", { description: handleError(error, "Delete Saved View") });
        }
      },
    });
  };

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

        {/* Custom (persisted) saved views. */}
        <div>
          <div className="px-2 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
            Custom views
          </div>

          {isLoadingSaved && savedViews.length === 0 ? (
            <div className="px-2 py-1.5 text-[12px] text-gray-400">Loading…</div>
          ) : savedViews.length === 0 ? (
            <div className="px-2.5 py-1.5 text-[12px] leading-snug text-gray-400">
              No saved views yet. Filter the queue, then save it.
            </div>
          ) : (
            savedViews.map((view) => {
              const selectionId = toSavedViewSelectionId(view.id);
              const isActive = selectionId === activeViewId;
              return (
                <div key={view.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelectSavedView(view)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] py-2 pl-2.5 pr-2 text-left text-[13px] font-medium transition-colors",
                      view.is_owner ? "group-hover:pr-8" : "",
                      isActive
                        ? "bg-[#EEF2FD] font-bold text-[#3E63D8]"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Bookmark
                      className={cn(
                        "h-[16px] w-[16px] shrink-0",
                        isActive ? "text-[#5479EE]" : "text-gray-400"
                      )}
                    />
                    <span className="flex-1 truncate">{view.name}</span>
                    {view.is_shared && (
                      <Users
                        className="h-3.5 w-3.5 shrink-0 text-gray-400"
                        aria-label="Shared with your team"
                      />
                    )}
                    {isActive && (
                      <span className="min-w-[24px] rounded-full bg-[#E1E8FC] px-2 py-0.5 text-center text-xs font-semibold text-[#3E63D8]">
                        {isLoading ? "…" : (activeTotal ?? 0)}
                      </span>
                    )}
                  </button>

                  {view.is_owner && (
                    <button
                      type="button"
                      onClick={() => handleDelete(view)}
                      aria-label={`Delete saved view ${view.name}`}
                      className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 place-items-center rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:grid"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}

          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="mt-1.5 flex w-full items-center gap-2 rounded-[10px] border border-dashed border-gray-200 px-2.5 py-2 text-[12.5px] font-semibold text-gray-500 transition-colors hover:border-[#5479EE] hover:bg-[#EEF2FD] hover:text-[#3E63D8]"
          >
            <Plus className="h-[15px] w-[15px] shrink-0" />
            Save current view
          </button>
        </div>
      </nav>

      {/* Claim-next queue puller (Phase 4a). */}
      <ClaimNextControl onClaimed={onConversationClaimed} />

      <SaveViewDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        filters={currentFilters}
        onCreated={onSelectSavedView}
      />

      {confirmationPopup}
    </aside>
  );
}

// Dialog to name + persist the current queue filters as a saved view, with an
// optional "share with team" toggle. On success the new view is selected.
function SaveViewDialog({
  open,
  onClose,
  filters,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  filters: SavedViewFilters;
  onCreated: (view: SavedView) => void;
}) {
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const createMutation = useCreateSavedView();

  const reset = () => {
    setName("");
    setIsShared(false);
  };

  const handleClose = () => {
    if (createMutation.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      notify.warning("Name required", { description: "Give this view a name before saving." });
      return;
    }
    createMutation.mutate(
      { name: trimmed, resource: "conversation", filters, is_shared: isShared },
      {
        onSuccess: (created) => {
          notify.success("Saved view created");
          onCreated(created);
          reset();
          onClose();
        },
        onError: (error) => notify.error("Error", { description: handleError(error, "Save View") }),
      }
    );
  };

  const activeFilters = describeFilters(filters);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : handleClose())} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save current view</DialogTitle>
          <p className="text-sm text-gray-500">
            Save the queue&apos;s current filters as a reusable view.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-gray-600">View name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. My urgent WhatsApp"
              disabled={createMutation.isPending}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13.5px] text-gray-800 outline-none focus:border-[#5479EE] focus:ring-2 focus:ring-[#EEF2FD]"
            />
          </div>

          <div>
            <div className="mb-1.5 text-[12.5px] font-semibold text-gray-600">Filters</div>
            {activeFilters.length === 0 ? (
              <p className="text-[12.5px] text-gray-400">
                No filters active - this view will show all conversations.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeFilters.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-[#EEF2FD] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#3E63D8]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              disabled={createMutation.isPending}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#5479EE]"
            />
            <span className="text-[12.5px] text-gray-700">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                {isShared ? <Users className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                Share with my team
              </span>
              <span className="mt-0.5 block text-gray-400">
                {isShared
                  ? "Everyone on your team will see this view."
                  : "Only you will see this view."}
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <AppButton variantStyle="outline" color="gray" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit} disabled={createMutation.isPending} isLoading={createMutation.isPending}>
            Save view
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Human-readable chips summarizing which filters a saved view will capture.
function describeFilters(filters: SavedViewFilters): string[] {
  const out: string[] = [];
  if (filters.status) out.push(`Status: ${filters.status}`);
  if (filters.priority) out.push(`Priority: ${filters.priority}`);
  if (filters.channel_type) out.push(`Channel: ${filters.channel_type}`);
  if (filters.assigned_to_me) out.push("Assigned to me");
  if (filters.unassigned) out.push("Unassigned");
  if (filters.q) out.push(`Search: “${filters.q}”`);
  return out;
}

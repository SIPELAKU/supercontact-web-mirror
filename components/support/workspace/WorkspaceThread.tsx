"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Divider, Menu, MenuItem } from "@mui/material";
import {
  ArrowLeft,
  Clock,
  Repeat,
  Check,
  ChevronDown,
  PanelRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MessageList from "@/components/omnichannel/MessageList";
import { ConversationViewersIndicator } from "@/components/omnichannel/ConversationViewersIndicator";
import { ConversationTypingIndicator } from "@/components/omnichannel/TypingIndicator";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppButton } from "@/components/ui/app-button";
import { AppTextarea } from "@/components/ui/app-textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ConversationWithMessages,
  ConversationListItem,
  SettableConversationStatus,
} from "@/lib/types/omnichannel";
import {
  useSetConversationStatus,
  useSnoozeConversation,
  useTransferConversation,
} from "@/lib/hooks/useOmnichannel";
import { useUsers } from "@/lib/hooks/useUsers";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { WorkspaceComposer } from "./WorkspaceComposer";
import { CHANNEL_META, STATUS_META, avatarColor, getInitials } from "./workspaceHelpers";

interface WorkspaceThreadProps {
  conversationId: string | null;
  conversation?: ConversationWithMessages;
  selectedItem: ConversationListItem | null;
  isLoading: boolean;
  contextOpen: boolean;
  onToggleContext: () => void;
  onBackToQueue: () => void;
}

export function WorkspaceThread({
  conversationId,
  conversation,
  selectedItem,
  isLoading,
  contextOpen,
  onToggleContext,
  onBackToQueue,
}: WorkspaceThreadProps) {
  if (!conversationId) {
    return (
      <main className="flex h-full min-w-0 flex-1 items-center justify-center bg-[#F7F8FB]">
        <div className="flex flex-col items-center gap-3 px-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF2FD] text-[#5479EE]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Select a conversation</p>
          <p className="max-w-xs text-sm text-gray-500">
            Pick a conversation from the queue to view the thread and start replying.
          </p>
        </div>
      </main>
    );
  }

  const name =
    conversation?.external_contact_name ||
    selectedItem?.external_contact_name ||
    conversation?.external_contact_identifier ||
    selectedItem?.external_contact_identifier ||
    "Unknown contact";
  const channelType = conversation?.channel_type || selectedItem?.channel_type || "web_widget";
  const channel = CHANNEL_META[channelType];
  const identifier =
    conversation?.external_contact_identifier || selectedItem?.external_contact_identifier || "";
  const color = avatarColor(identifier || conversationId);

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-[#F7F8FB]">
      <ThreadHeader
        conversationId={conversationId}
        conversation={conversation}
        name={name}
        color={color}
        channelLabel={channel.label}
        subLabel={identifier}
        currentAssigneeId={selectedItem?.assigned_user_id ?? undefined}
        contextOpen={contextOpen}
        onToggleContext={onToggleContext}
        onBackToQueue={onBackToQueue}
      />

      {/* Message stream (oldest -> newest) via the shared MessageList. */}
      <div className="flex min-h-0 flex-1 flex-col" role="log" aria-label="Conversation messages" aria-live="polite">
        {isLoading && !conversation ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <MessageList messages={conversation?.messages || []} channelType={channelType} />
        )}
      </div>

      {/* Visitor-typing indicator - sits just above the composer, at the bottom
          of the message stream. Auto-clears ~4s after the last WS signal. */}
      <ConversationTypingIndicator
        conversationId={conversationId}
        name={name.split(" ")[0]}
        className="shrink-0 px-4 pb-1 pt-0.5"
      />

      <WorkspaceComposer
        conversationId={conversationId}
        contactFirstName={name.split(" ")[0]}
      />
    </main>
  );
}

function ThreadHeader({
  conversationId,
  conversation,
  name,
  color,
  channelLabel,
  subLabel,
  currentAssigneeId,
  contextOpen,
  onToggleContext,
  onBackToQueue,
}: {
  conversationId: string;
  conversation?: ConversationWithMessages;
  name: string;
  color: string;
  channelLabel: string;
  subLabel: string;
  currentAssigneeId?: string;
  contextOpen: boolean;
  onToggleContext: () => void;
  onBackToQueue: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snoozeAnchor, setSnoozeAnchor] = useState<null | HTMLElement>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const statusMutation = useSetConversationStatus();
  const snoozeMutation = useSnoozeConversation();
  const currentStatus = conversation?.status ?? "open";

  const setStatus = (status: SettableConversationStatus) => {
    setAnchorEl(null);
    statusMutation.mutate(
      { conversationId, data: { status } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Update Status") }) }
    );
  };

  // Presets recomputed each time the menu (re)opens so "1 hour"/"Tomorrow" stay
  // relative to now. Times are built in the user's locale then serialized UTC.
  const snoozePresets = useMemo(() => computeSnoozePresets(), [snoozeAnchor]);
  const [customSnooze, setCustomSnooze] = useState("");

  const applySnooze = (iso: string) => {
    setSnoozeAnchor(null);
    setCustomSnooze("");
    snoozeMutation.mutate(
      { conversationId, snoozedUntil: iso },
      {
        onSuccess: () => notify.success("Conversation snoozed"),
        onError: (error) => notify.error("Error", { description: handleError(error, "Snooze Conversation") }),
      }
    );
  };

  const applyCustomSnooze = () => {
    if (!customSnooze) return;
    const parsed = new Date(customSnooze);
    if (Number.isNaN(parsed.getTime())) {
      notify.warning("Invalid date", { description: "Please pick a valid snooze date and time." });
      return;
    }
    applySnooze(parsed.toISOString());
  };

  // "More" status actions besides the primary Solve button.
  const STATUS_ACTIONS: { label: string; value: SettableConversationStatus }[] = [
    { label: "Reopen", value: "open" },
    { label: "Close", value: "closed" },
    { label: "Archive", value: "archived" },
  ];
  const isSolved = currentStatus === "solved";

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
      <button
        type="button"
        onClick={onBackToQueue}
        className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Back to queue"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[15.5px] font-bold leading-tight text-gray-900">{name}</h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            <span className="truncate">
              {channelLabel}
              {subLabel ? ` · ${subLabel}` : ""}
            </span>
          </div>
          {/* Collision presence: other agents viewing this conversation. */}
          <div className="mt-0.5">
            <ConversationViewersIndicator conversationId={conversationId} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* Snooze - preset schedule + custom date-time (auto-reopen). */}
        <button
          type="button"
          onClick={(e) => setSnoozeAnchor(e.currentTarget)}
          disabled={snoozeMutation.isPending}
          className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 sm:inline-flex"
          aria-haspopup="menu"
          aria-expanded={Boolean(snoozeAnchor)}
        >
          <Clock className="h-3.5 w-3.5" />
          Snooze
        </button>
        <Menu
          anchorEl={snoozeAnchor}
          open={Boolean(snoozeAnchor)}
          onClose={() => setSnoozeAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem disabled sx={{ fontSize: 11, opacity: 0.7 }}>
            Snooze until…
          </MenuItem>
          {snoozePresets.map((preset) => (
            <MenuItem key={preset.label} onClick={() => applySnooze(preset.iso)} sx={{ fontSize: 13 }}>
              {preset.label}
            </MenuItem>
          ))}
          <Divider />
          <div className="px-3 py-2" onKeyDown={(e) => e.stopPropagation()}>
            <label className="mb-1 block text-[11px] font-semibold text-gray-500">Custom date &amp; time</label>
            <input
              type="datetime-local"
              value={customSnooze}
              onChange={(e) => setCustomSnooze(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-[#5479EE] focus:ring-2 focus:ring-[#EEF2FD]"
            />
            <div className="mt-2 flex justify-end">
              <AppButton size="small" onClick={applyCustomSnooze} disabled={!customSnooze || snoozeMutation.isPending}>
                Snooze
              </AppButton>
            </div>
          </div>
        </Menu>

        {/* Transfer - hand the conversation to another agent. */}
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:inline-flex"
        >
          <Repeat className="h-3.5 w-3.5" />
          Transfer
        </button>

        {/* Solve (primary) */}
        <button
          type="button"
          onClick={() => setStatus("solved")}
          disabled={statusMutation.isPending || isSolved}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          {isSolved ? "Solved" : "Solve"}
        </button>

        {/* Status menu (reopen / close / archive) */}
        <button
          type="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={statusMutation.isPending}
          className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          aria-label="Change status"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled sx={{ fontSize: 11, opacity: 0.7 }}>
            Status: {STATUS_META[currentStatus]?.label ?? currentStatus}
          </MenuItem>
          {STATUS_ACTIONS.filter((a) => a.value !== currentStatus).map((a) => (
            <MenuItem key={a.value} onClick={() => setStatus(a.value)} sx={{ fontSize: 13 }}>
              {a.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Context panel toggle */}
        <button
          type="button"
          onClick={onToggleContext}
          className={cn(
            "hidden h-8 w-8 place-items-center rounded-lg border xl:grid",
            contextOpen
              ? "border-[#5479EE] bg-[#EEF2FD] text-[#3E63D8]"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          )}
          aria-label={contextOpen ? "Hide context panel" : "Show context panel"}
          aria-pressed={contextOpen}
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>

      <TransferDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        conversationId={conversationId}
        currentAssigneeId={currentAssigneeId}
      />
    </header>
  );
}

// Preset snooze targets, computed in the user's locale and serialized to UTC
// ISO-8601 for the backend. "Tomorrow"/"Next week" land at 09:00 local.
function computeSnoozePresets(): { label: string; iso: string }[] {
  const now = new Date();
  const plusHours = (h: number) => new Date(now.getTime() + h * 3600_000).toISOString();
  const atNineAmInDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };
  return [
    { label: "1 hour", iso: plusHours(1) },
    { label: "3 hours", iso: plusHours(3) },
    { label: "Tomorrow, 9:00 AM", iso: atNineAmInDays(1) },
    { label: "Next week", iso: atNineAmInDays(7) },
  ];
}

interface UserOption {
  value: string;
  label: string;
}

// Transfer dialog - agent picker (same useUsers-based recipe as the context
// panel's Assignee control) + an optional note. Excludes the current assignee.
function TransferDialog({
  open,
  onClose,
  conversationId,
  currentAssigneeId,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentAssigneeId?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserOption | null>(null);
  const [note, setNote] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((_event: any, value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 20, search);
  const userOptions: UserOption[] = (usersData?.data?.users || [])
    .filter((u) => u.id !== currentAssigneeId)
    .map((u) => ({ value: u.id, label: u.fullname }));

  const transferMutation = useTransferConversation();

  const reset = () => {
    setSearch("");
    setSelected(null);
    setNote("");
  };

  const handleClose = () => {
    if (transferMutation.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!selected) {
      notify.warning("Select an agent", { description: "Choose the agent to transfer this conversation to." });
      return;
    }
    transferMutation.mutate(
      { conversationId, data: { assigned_user_id: selected.value, note: note.trim() || undefined } },
      {
        onSuccess: () => {
          notify.success(`Conversation transferred to ${selected.label}`);
          reset();
          onClose();
        },
        onError: (error) => notify.error("Error", { description: handleError(error, "Transfer Conversation") }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : handleClose())} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer conversation</DialogTitle>
          <p className="text-sm text-gray-500">Hand this conversation to another agent, with an optional note.</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-gray-600">Transfer to</label>
            <AppAutocomplete
              isBgWhite
              options={userOptions}
              placeholder="Search agents…"
              value={selected}
              onChange={(_e, newValue) => setSelected(newValue as UserOption | null)}
              onInputChange={handleSearchChange}
              loading={isLoadingUsers}
              disabled={transferMutation.isPending}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-gray-600">Note (optional)</label>
            <AppTextarea
              isBgWhite
              rows={3}
              placeholder="Add context for the agent taking over…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <AppButton variantStyle="outline" color="gray" onClick={handleClose} disabled={transferMutation.isPending}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit} disabled={!selected || transferMutation.isPending} isLoading={transferMutation.isPending}>
            Transfer
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

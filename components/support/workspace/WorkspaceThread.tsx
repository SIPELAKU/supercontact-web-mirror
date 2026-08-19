"use client";

import React, { useState } from "react";
import { Menu, MenuItem, Tooltip } from "@mui/material";
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
import {
  ConversationWithMessages,
  ConversationListItem,
  SettableConversationStatus,
} from "@/lib/types/omnichannel";
import { useSetConversationStatus } from "@/lib/hooks/useOmnichannel";
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
  contextOpen: boolean;
  onToggleContext: () => void;
  onBackToQueue: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const statusMutation = useSetConversationStatus();
  const currentStatus = conversation?.status ?? "open";

  const setStatus = (status: SettableConversationStatus) => {
    setAnchorEl(null);
    statusMutation.mutate(
      { conversationId, data: { status } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Update Status") }) }
    );
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
        {/* Snooze - render but DISABLED (no snooze scheduling backend).
            TODO(Support Desk Phase 2): wire Snooze (auto-reopen). */}
        <Tooltip title="Coming soon" arrow>
          <span>
            <button
              type="button"
              disabled
              className="hidden cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-300 sm:inline-flex"
            >
              <Clock className="h-3.5 w-3.5" />
              Snooze
            </button>
          </span>
        </Tooltip>

        {/* Transfer - render but DISABLED (no transfer/handoff backend).
            TODO(Support Desk Phase 2): wire Transfer to another agent/team. */}
        <Tooltip title="Coming soon" arrow>
          <span>
            <button
              type="button"
              disabled
              className="hidden cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-300 sm:inline-flex"
            >
              <Repeat className="h-3.5 w-3.5" />
              Transfer
            </button>
          </span>
        </Tooltip>

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
    </header>
  );
}

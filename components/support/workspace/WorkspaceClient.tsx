"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { usePermission } from "@/lib/hooks/usePermission";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useConversationInbox,
  useConversation,
  useMarkAsRead,
} from "@/lib/hooks/useOmnichannel";
import { useOmnichannelRealtime } from "@/lib/hooks/useOmnichannelRealtime";
import {
  ConversationListItem,
  ConversationStatus,
  ConversationPriority,
  ConversationInboxFilters,
  ConversationWithMessages,
} from "@/lib/types/omnichannel";
import { ChannelType } from "./workspaceHelpers";
import { WORKSPACE_VIEWS, WorkspaceView, WorkspaceViewId } from "./workspaceViews";
import { WorkspaceViewsRail } from "./WorkspaceViewsRail";
import { ConversationQueueList } from "./ConversationQueueList";
import { WorkspaceThread } from "./WorkspaceThread";
import { WorkspaceContextPanel } from "./WorkspaceContextPanel";

type StatusValue = ConversationStatus | "all";
type PriorityValue = ConversationPriority | "all";
type ChannelValue = ChannelType | "all";

const QUEUE_PAGE_LIMIT = 30;

// Projects a full claimed conversation down to the ConversationListItem shape
// the queue/thread/context panes consume, so a just-claimed conversation shows
// immediately even before the inbox list refetch lands.
function claimedToListItem(c: ConversationWithMessages): ConversationListItem {
  return {
    id: c.id,
    account_id: c.account_id,
    channel_type: c.channel_type,
    external_contact_identifier: c.external_contact_identifier,
    external_contact_name: c.external_contact_name,
    status: c.status,
    priority: c.priority,
    last_message_at: c.last_message_at,
    last_message_preview: c.last_message_preview,
    unread_count: c.unread_count,
    subject: c.subject,
    snoozed_until: c.snoozed_until,
    sla: c.sla,
  };
}

export default function WorkspaceClient() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Views rail preset -> base filters (status + assignment).
  const [activeViewId, setActiveViewId] = useState<WorkspaceViewId>("assigned_to_me");
  const [statusFilter, setStatusFilter] = useState<StatusValue>("all");
  const [assignedToMe, setAssignedToMe] = useState(true);
  const [unassigned, setUnassigned] = useState(false);

  // Queue refinements layered on top of the view preset.
  const [q, setQ] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityValue>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelValue>("all");

  // Selection: keep the id + a snapshot of the row so the thread stays open
  // even if the conversation drops out of the current filtered view.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ConversationListItem | null>(null);

  const [contextOpen, setContextOpen] = useState(true);

  // Deep-link: ?conversation=<id> (e.g. from a web-widget notification).
  // Apply each distinct param value once - opens the thread on load / when a
  // new notification is clicked while the page stays mounted, without fighting
  // the user's manual queue selections afterwards. Selecting by id is enough:
  // useConversation fetches it and WorkspaceThread renders from that even when
  // the conversation isn't in the current queue filter (snapshot stays null).
  const conversationParam = searchParams.get("conversation");
  const appliedDeepLinkRef = useRef<string | null>(null);
  useEffect(() => {
    if (!conversationParam) return;
    if (appliedDeepLinkRef.current === conversationParam) return;
    appliedDeepLinkRef.current = conversationParam;
    setSelectedId(conversationParam);
    setSelectedSnapshot(null);
  }, [conversationParam]);

  const selectView = (view: WorkspaceView) => {
    setActiveViewId(view.id);
    setStatusFilter(view.filters.status ?? "all");
    setAssignedToMe(!!view.filters.assigned_to_me);
    setUnassigned(!!view.filters.unassigned);
  };

  const filters: ConversationInboxFilters = useMemo(
    () => ({
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      channel_type: channelFilter !== "all" ? channelFilter : undefined,
      assigned_to_me: assignedToMe || undefined,
      unassigned: unassigned || undefined,
      q: q.trim() || undefined,
      page: 1,
      limit: QUEUE_PAGE_LIMIT,
    }),
    [statusFilter, priorityFilter, channelFilter, assignedToMe, unassigned, q]
  );

  const {
    data: inboxData,
    isLoading: isLoadingQueue,
    isError: isQueueError,
  } = useConversationInbox(filters);

  const items = inboxData?.conversations ?? [];
  const total = inboxData?.total ?? 0;

  // Fresh row from the latest list when present, else the snapshot taken at
  // selection time. Keeps assignee/status/priority in sync after mutations.
  const currentItem: ConversationListItem | null = useMemo(() => {
    if (!selectedId) return null;
    return items.find((c) => c.id === selectedId) ?? selectedSnapshot;
  }, [selectedId, items, selectedSnapshot]);

  const { data: conversation, isLoading: isLoadingConversation } = useConversation(selectedId || "");

  // Queue + open-thread live updates (WS with polling backstop).
  useOmnichannelRealtime(selectedId || undefined);

  // Mark the open conversation as read once it loads with unread messages.
  const markAsReadMutation = useMarkAsRead();
  useEffect(() => {
    if (conversation && conversation.unread_count > 0) {
      markAsReadMutation.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.unread_count]);

  const handleSelect = (item: ConversationListItem) => {
    setSelectedId(item.id);
    setSelectedSnapshot(item);
  };

  const handleBackToQueue = () => {
    setSelectedId(null);
    setSelectedSnapshot(null);
  };

  // "Claim next" pulled a conversation off a queue - seed the detail cache and
  // select it so the thread opens instantly.
  const handleConversationClaimed = (conversation: ConversationWithMessages) => {
    queryClient.setQueryData(
      ["omnichannels", "conversations", conversation.id],
      conversation
    );
    setSelectedId(conversation.id);
    setSelectedSnapshot(claimedToListItem(conversation));
  };

  const activeView = WORKSPACE_VIEWS.find((v) => v.id === activeViewId);
  const viewLabel = activeView?.label ?? "Conversations";

  // Defensive gate mirroring the sidebar entry (omnichannel:use). The link is
  // already hidden for users without the permission; this covers direct nav.
  if (!can("omnichannel:use")) {
    return (
      <div className="flex h-[calc(100vh-52px)] items-center justify-center p-8">
        <EmptyState
          icon={Lock}
          title="No access to the workspace"
          description="You don't have permission to use the agent workspace. Contact your administrator if you think this is a mistake."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-52px)] w-full overflow-hidden bg-[#F7F8FB]">
      {/* Views rail - collapses below lg */}
      <div className="hidden w-[230px] shrink-0 lg:flex">
        <WorkspaceViewsRail
          activeViewId={activeViewId}
          onSelectView={selectView}
          activeTotal={total}
          isLoading={isLoadingQueue}
          onConversationClaimed={handleConversationClaimed}
        />
      </div>

      {/* Queue list - on mobile, shown until a conversation is selected */}
      <div className={cn("w-full shrink-0 md:flex md:w-[340px]", selectedId ? "hidden md:flex" : "flex")}>
        <ConversationQueueList
          viewLabel={viewLabel}
          items={items}
          total={total}
          isLoading={isLoadingQueue}
          isError={isQueueError}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={q}
          onSearchChange={setQ}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          channelFilter={channelFilter}
          onChannelChange={setChannelFilter}
        />
      </div>

      {/* Thread - on mobile, shown once a conversation is selected */}
      <div className={cn("min-w-0 flex-1", selectedId ? "flex" : "hidden md:flex")}>
        <WorkspaceThread
          conversationId={selectedId}
          conversation={conversation}
          selectedItem={currentItem}
          isLoading={isLoadingConversation}
          contextOpen={contextOpen}
          onToggleContext={() => setContextOpen((v) => !v)}
          onBackToQueue={handleBackToQueue}
        />
      </div>

      {/* Context panel - collapses below xl and via the header toggle */}
      <div className={cn("shrink-0 xl:w-[322px]", contextOpen ? "hidden xl:flex" : "hidden")}>
        <WorkspaceContextPanel selectedItem={currentItem} conversation={conversation} />
      </div>
    </div>
  );
}

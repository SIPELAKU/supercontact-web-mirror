"use client";

import React, { useEffect, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { Search, Flag, ChevronDown, MessageCircle, Mail, Globe, Inbox, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConversationListItem,
  ConversationStatus,
  ConversationPriority,
} from "@/lib/types/omnichannel";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChannelType,
  CHANNEL_META,
  PRIORITY_META,
  STATUS_META,
  SLA_TONE_META,
  avatarColor,
  formatRelativeTime,
  formatSlaRemaining,
  getSlaChipState,
  getInitials,
} from "./workspaceHelpers";

const CHANNEL_ICON: Record<ChannelType, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  web_widget: Globe,
};

type StatusValue = ConversationStatus | "all";
type PriorityValue = ConversationPriority | "all";
type ChannelValue = ChannelType | "all";

interface FilterOption {
  value: string;
  label: string;
}

// Compact dropdown "chip" (mirrors the mockup's Open/Priority/Channel chips).
function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const active = value !== "all";
  const activeLabel = options.find((o) => o.value === value)?.label;

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
          active
            ? "border-[#5479EE] bg-[#EEF2FD] text-[#3E63D8]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        )}
      >
        {active ? activeLabel : label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === value}
            onClick={() => {
              onChange(opt.value);
              setAnchorEl(null);
            }}
            sx={{ fontSize: 13 }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "Any status" },
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "solved", label: "Solved" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "all", label: "Any priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const CHANNEL_OPTIONS: FilterOption[] = [
  { value: "all", label: "Any channel" },
  { value: "web_widget", label: "Web widget" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

interface ConversationQueueListProps {
  viewLabel: string;
  items: ConversationListItem[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  selectedId: string | null;
  onSelect: (item: ConversationListItem) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusValue;
  onStatusChange: (value: StatusValue) => void;
  priorityFilter: PriorityValue;
  onPriorityChange: (value: PriorityValue) => void;
  channelFilter: ChannelValue;
  onChannelChange: (value: ChannelValue) => void;
}

export function ConversationQueueList({
  viewLabel,
  items,
  total,
  isLoading,
  isError,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  channelFilter,
  onChannelChange,
}: ConversationQueueListProps) {
  // Local, debounced search input so keystrokes don't refire the query on
  // every character (committed upward after 350ms).
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) onSearchChange(searchInput);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // One shared, low-frequency ticker drives every row's SLA countdown so the
  // chips stay live without re-rendering the whole list every second.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="flex h-full w-full flex-col overflow-hidden border-l border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 pb-2.5 pt-3.5">
        <div className="flex items-center justify-between">
          <h2 className="truncate text-[15px] font-bold text-gray-900">{viewLabel}</h2>
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            {isLoading ? "…" : `${total} ${total === 1 ? "conversation" : "conversations"}`}
          </span>
        </div>

        {/* Search */}
        <label className="mt-2.5 flex items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-2.5 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
          />
        </label>

        {/* Filter chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <FilterChip
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => onStatusChange(v as StatusValue)}
          />
          <FilterChip
            label="Priority"
            value={priorityFilter}
            options={PRIORITY_OPTIONS}
            onChange={(v) => onPriorityChange(v as PriorityValue)}
          />
          <FilterChip
            label="Channel"
            value={channelFilter}
            options={CHANNEL_OPTIONS}
            onChange={(v) => onChannelChange(v as ChannelValue)}
          />
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversation queue">
        {isError ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="Couldn't load conversations"
              description="Something went wrong fetching the queue. It will retry automatically."
            />
          </div>
        ) : isLoading && items.length === 0 ? (
          <QueueSkeleton />
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="No conversations"
              description="Nothing matches this view and filters right now."
            />
          </div>
        ) : (
          items.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => onSelect(item)}
              now={now}
            />
          ))
        )}
      </div>
    </section>
  );
}

function QueueRow({
  item,
  selected,
  onSelect,
  now,
}: {
  item: ConversationListItem;
  selected: boolean;
  onSelect: () => void;
  now: number;
}) {
  const name = item.external_contact_name || item.external_contact_identifier || "Unknown contact";
  const status = STATUS_META[item.status] ?? STATUS_META.open;
  const priority = item.priority ? PRIORITY_META[item.priority] : null;
  const channel = CHANNEL_META[item.channel_type];
  const ChannelIcon = CHANNEL_ICON[item.channel_type];
  const color = avatarColor(item.external_contact_identifier || item.id);
  const unread = item.unread_count > 0;
  const sla = getSlaChipState(item.sla, now);

  return (
    <button
      type="button"
      onClick={onSelect}
      role="listitem"
      aria-current={selected ? "true" : undefined}
      className={cn(
        "relative grid w-full grid-cols-[40px_1fr] gap-3 border-b border-l-[3px] border-gray-100 px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-l-[#5479EE] bg-[#EEF2FD]"
          : "border-l-transparent hover:bg-gray-50"
      )}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex-1 truncate text-[13.5px]",
              unread ? "font-extrabold text-gray-900" : "font-bold text-gray-800"
            )}
          >
            {name}
          </span>
          <span className="shrink-0 text-[11px] font-medium text-gray-400">
            {formatRelativeTime(item.last_message_at)}
          </span>
        </div>

        <p className={cn("mt-0.5 truncate text-[12.5px]", unread ? "text-gray-700" : "text-gray-500")}>
          {item.last_message_preview || item.subject || "No messages yet"}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
              status.pill
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>

          {priority && item.priority && item.priority !== "normal" && (
            <span className={cn("inline-flex items-center gap-0.5 text-[10.5px] font-bold", priority.className)}>
              <Flag className="h-3 w-3" fill="currentColor" />
              {priority.label}
            </span>
          )}

          <span
            className={cn("flex h-[15px] w-[15px] items-center justify-center rounded-[4px]", channel.badge)}
            title={channel.label}
          >
            <ChannelIcon className="h-2.5 w-2.5 text-white" />
          </span>

          {sla && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums",
                SLA_TONE_META[sla.tone].chip
              )}
              title={`SLA ${sla.label === "FR" ? "first response" : "resolution"}${
                sla.tone === "breach" ? " breached" : ` due in ${formatSlaRemaining(sla.remainingMs)}`
              }`}
            >
              <Clock className="h-3 w-3" />
              {sla.label} {formatSlaRemaining(sla.remainingMs)}
            </span>
          )}
        </div>
      </div>

      {unread && (
        <span className="absolute right-3.5 top-3 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#5479EE] px-1.5 text-[10.5px] font-bold text-white">
          {item.unread_count}
        </span>
      )}
    </button>
  );
}

function QueueSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[40px_1fr] gap-3 px-3.5 py-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-2.5 w-3/4 rounded bg-gray-100" />
            <div className="h-2.5 w-1/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

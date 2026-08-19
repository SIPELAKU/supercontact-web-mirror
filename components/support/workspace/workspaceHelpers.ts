// Shared pure helpers for the Support Desk agent workspace
// (components/support/workspace/*). No JSX here - icon rendering lives in the
// components; this module only returns labels, colour tokens and formatted
// strings so the design stays consistent across the queue row, the thread
// header and the context panel.

import { ConversationStatus, ConversationPriority } from "@/lib/types/omnichannel";

export type ChannelType = "whatsapp" | "email" | "web_widget";

// Deterministic avatar palette (brand blue first, then a small warm/cool
// spread) so a given contact always gets the same colour across panes.
const AVATAR_PALETTE = [
  "#5479EE",
  "#D9600A",
  "#128A5B",
  "#8B5CF6",
  "#D33A3F",
  "#0EA5E9",
  "#DB2777",
  "#0D9488",
];

export function getInitials(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  return (
    trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function avatarColor(seed?: string | null): string {
  const s = seed || "";
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// Compact "2m / 5h / 3d / 12 Aug" relative time for the queue rows.
export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export interface StatusMeta {
  label: string;
  pill: string; // Tailwind classes for the status pill
  dot: string; // dot colour class
}

export const STATUS_META: Record<ConversationStatus, StatusMeta> = {
  open: { label: "Open", pill: "text-blue-600 bg-blue-50", dot: "bg-blue-500" },
  snoozed: { label: "Snoozed", pill: "text-purple-600 bg-purple-50", dot: "bg-purple-500" },
  solved: { label: "Solved", pill: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  closed: { label: "Closed", pill: "text-gray-500 bg-gray-100", dot: "bg-gray-400" },
  archived: { label: "Archived", pill: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
};

export interface PriorityMeta {
  label: string;
  className: string; // text colour for the flag + label
}

export const PRIORITY_META: Record<ConversationPriority, PriorityMeta> = {
  urgent: { label: "Urgent", className: "text-red-600" },
  high: { label: "High", className: "text-orange-600" },
  normal: { label: "Normal", className: "text-gray-500" },
  low: { label: "Low", className: "text-gray-400" },
};

export interface ChannelMeta {
  label: string;
  badge: string; // background colour class for the little channel chip
}

export const CHANNEL_META: Record<ChannelType, ChannelMeta> = {
  web_widget: { label: "Web widget", badge: "bg-[#5479EE]" },
  whatsapp: { label: "WhatsApp", badge: "bg-[#25D366]" },
  email: { label: "Email", badge: "bg-[#8B5CF6]" },
};

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Search, User } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useUnifiedFeed } from "@/lib/hooks/useSupportWorkspace";
import { UnifiedFeedItem, UnifiedFeedKind } from "@/lib/api/support-workspace";
import { CHANNEL_META, ChannelType, formatRelativeTime } from "@/components/support/workspace/workspaceHelpers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Deep-link routing: a ticket row opens the ticket detail page; a conversation
// row opens whichever surface that conversation actually lives on, matching
// getNotificationRoute() in lib/api/notifications.ts:
//   - web_widget / messenger -> Support Desk Workspace (?conversation=<id>)
//     (messenger follows the web-widget precedent: a PSID has no phone/email
//     contact identity, so those conversations live conversation-first)
//   - whatsapp/sms/email (and any other channel) -> contact-first Omnichannel
//     Inbox
// ---------------------------------------------------------------------------
function feedItemHref(item: UnifiedFeedItem): string {
    if (item.kind === "ticket") return `/support/tickets/${item.id}`;
    if (item.channel_type === "web_widget" || item.channel_type === "messenger") {
        return `/support/workspace?conversation=${item.id}`;
    }
    return `/omnichannel?conversation=${item.id}`;
}

// Case-insensitive colour lookups spanning BOTH vocabularies (tickets use
// title-case "Open"/"In Progress"; conversations use lowercase
// "open"/"snoozed") so a row is coloured no matter which side it came from.
const STATUS_COLORS: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-800",
    "on-hold": "bg-slate-100 text-slate-700",
    "in progress": "bg-green-100 text-green-700",
    snoozed: "bg-purple-100 text-purple-700",
    solved: "bg-emerald-600 text-white",
    closed: "bg-gray-100 text-gray-700",
    archived: "bg-amber-100 text-amber-700",
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: "bg-red-600 text-white",
    high: "bg-red-100 text-red-700",
    medium: "bg-orange-100 text-orange-700",
    normal: "bg-gray-100 text-gray-600",
    low: "bg-blue-50 text-blue-600",
};

function prettify(value: string): string {
    return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusPill({ value }: { value: string }) {
    if (!value) return null;
    const className = STATUS_COLORS[value.toLowerCase()] ?? "bg-gray-100 text-gray-700";
    return (
        <Badge className={cn("rounded-full px-3 py-1 font-medium border-none", className)} variant="secondary">
            {prettify(value)}
        </Badge>
    );
}

function PriorityPill({ value }: { value: string }) {
    if (!value) return null;
    const className = PRIORITY_COLORS[value.toLowerCase()] ?? "bg-gray-100 text-gray-600";
    return (
        <Badge className={cn("rounded-full px-3 py-1 font-medium border-none", className)} variant="secondary">
            {prettify(value)}
        </Badge>
    );
}

// The kind chip: a neutral "Ticket" pill for tickets, or the channel chip
// (WhatsApp / Email / Web widget) for conversations.
function KindChip({ item }: { item: UnifiedFeedItem }) {
    if (item.kind === "ticket") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Ticket
            </span>
        );
    }
    const meta = item.channel_type ? CHANNEL_META[item.channel_type as ChannelType] : undefined;
    const label = meta?.label ?? "Conversation";
    const dot = meta?.badge ?? "bg-gray-400";
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
            {label}
        </span>
    );
}

const KIND_TABS: { value: UnifiedFeedKind | ""; label: string }[] = [
    { value: "", label: "All" },
    { value: "ticket", label: "Tickets" },
    { value: "conversation", label: "Conversations" },
];

// A permissive status list spanning both entities. Read-only best-effort - the
// backend filters on the raw string; unmatched values simply return fewer rows.
const STATUS_OPTIONS = ["Open", "Pending", "In Progress", "On-hold", "Snoozed", "Solved", "Closed", "Archived"];

function FeedRow({ item }: { item: UnifiedFeedItem }) {
    return (
        <Link
            href={feedItemHref(item)}
            className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
        >
            {/* Left: kind + title + code */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <KindChip item={item} />
                    {item.ticket_code && (
                        <span className="font-mono text-xs text-gray-400">#{item.ticket_code}</span>
                    )}
                    <span className="min-w-0 truncate font-medium text-gray-900">
                        {item.title || "(no subject)"}
                    </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    {item.contact_name && (
                        <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.contact_name}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <span className="text-gray-400">Assignee:</span>
                        <span className="text-gray-600">{item.assignee_name || "Unassigned"}</span>
                    </span>
                </div>
            </div>

            {/* Right: status + priority + relative time */}
            <div className="flex shrink-0 items-center gap-2">
                <StatusPill value={item.status} />
                <PriorityPill value={item.priority} />
                <span className="w-14 text-right text-xs text-gray-400">
                    {formatRelativeTime(item.updated_at)}
                </span>
            </div>
        </Link>
    );
}

export default function UnifiedFeedClient() {
    const [kind, setKind] = useState<UnifiedFeedKind | "">("");
    const [status, setStatus] = useState("");
    const [assignedToMe, setAssignedToMe] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const debouncedSearch = useDebounce(search, 400);

    const params = useMemo(
        () => ({
            kind: kind || undefined,
            status: status || undefined,
            assignedToMe,
            q: debouncedSearch || undefined,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
        }),
        [kind, status, assignedToMe, debouncedSearch, page]
    );

    const { data, isLoading, isError, refetch, isFetching } = useUnifiedFeed(params);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Any filter change resets to the first page.
    const resetAnd = <T,>(setter: (v: T) => void) => (v: T) => {
        setter(v);
        setPage(0);
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="All Work"
                description="Every ticket and conversation in one unified feed."
                breadcrumbs={[{ label: "Support" }, { label: "All Work" }]}
            />

            {/* Filter bar */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Kind toggle */}
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        {KIND_TABS.map((tab) => (
                            <button
                                key={tab.value || "all"}
                                type="button"
                                onClick={() => resetAnd(setKind)(tab.value)}
                                className={cn(
                                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                    kind === tab.value
                                        ? "bg-white text-[#5479EE] shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        {/* Search */}
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => resetAnd(setSearch)(e.target.value)}
                                placeholder="Search work..."
                                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5479EE] focus:ring-1 focus:ring-[#5479EE]"
                            />
                        </div>

                        {/* Status select */}
                        <select
                            value={status}
                            onChange={(e) => resetAnd(setStatus)(e.target.value)}
                            className="rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-700 outline-none focus:border-[#5479EE] focus:ring-1 focus:ring-[#5479EE]"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        {/* Assigned to me */}
                        <button
                            type="button"
                            onClick={() => resetAnd(setAssignedToMe)(!assignedToMe)}
                            aria-pressed={assignedToMe}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                assignedToMe
                                    ? "border-[#5479EE] bg-[#5479EE]/10 text-[#5479EE]"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <User className="h-4 w-4" />
                            Assigned to me
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-4">
                                <div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" />
                                <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                                <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p className="text-sm text-gray-600">Failed to load the workspace feed.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-[#5479EE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F66E0]"
                        >
                            Retry
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No work found</p>
                        <p className="text-sm text-gray-400">
                            Try clearing filters or switching the kind tab.
                        </p>
                    </div>
                ) : (
                    <div className={cn(isFetching && "opacity-60 transition-opacity")}>
                        {items.map((item) => (
                            <FeedRow key={`${item.kind}-${item.id}`} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !isError && total > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        {total} item{total === 1 ? "" : "s"} · Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                            disabled={page + 1 >= totalPages}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

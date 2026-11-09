"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip } from "@mui/material";
import { format } from "date-fns";
import { Lock, MessagesSquare, Plus } from "lucide-react";

import { SuperTable, type MRT_ColumnDef } from "@/components/ui/super-table";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
    CHANNEL_META,
    STATUS_META,
    formatRelativeTime,
} from "@/components/support/workspace/workspaceHelpers";
import { useContactConversations, contactConversationsKey } from "@/lib/hooks/useContacts";
import type { ContactConversationItem, ContactConversationQuery } from "@/lib/types/omnichannel";
import { ContactConversationDrawer } from "./ContactConversationDrawer";
import { StartConversationPanel } from "./ContactChannelChat";
import {
    CONTACT_CONVERSATION_CHANNEL_OPTIONS,
    CONTACT_CONVERSATION_PAGE_SIZES,
    CONTACT_CONVERSATION_SORT_COLUMN,
    INITIAL_CONTACT_CONVERSATION_QUERY,
    nextContactConversationQuery,
} from "./contactConversations";

interface ContactConversationsTabProps {
    contactId: string;
    contactName?: string;
}

// Every conversation of this contact across channels (BE-1.2), newest first,
// including Solved/Closed/Archived ones. A row opens the full history with a
// reply box in a drawer; "Start conversation" opens a new WhatsApp/SMS/Email
// thread. The WhatsApp tab keeps the single-thread ContactChannelChat.
export const ContactConversationsTab = ({ contactId, contactName }: ContactConversationsTabProps) => {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<ContactConversationQuery>(INITIAL_CONTACT_CONVERSATION_QUERY);
    const [openItem, setOpenItem] = useState<ContactConversationItem | null>(null);
    const [isStartOpen, setIsStartOpen] = useState(false);

    const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
        useContactConversations(contactId, query);
    const canOpen = data?.can_open_conversation ?? false;

    const columns = useMemo<MRT_ColumnDef<ContactConversationItem>[]>(
        () => [
            {
                id: "channel_type",
                header: "Channel",
                size: 170,
                enableSorting: false,
                accessorFn: (row) => CHANNEL_META[row.channel_type]?.label ?? row.channel_type,
                Cell: ({ row }) => (
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-gray-900">
                            {CHANNEL_META[row.original.channel_type]?.label ?? row.original.channel_type}
                        </span>
                        {!row.original.identity_verified && (
                            <Tooltip title="Matched to this contact by the email the visitor typed" arrow>
                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                                    Email not verified
                                </span>
                            </Tooltip>
                        )}
                    </div>
                ),
            },
            {
                id: "account_name",
                header: "Account",
                size: 150,
                enableSorting: false,
                accessorFn: (row) => row.account_name ?? "",
                Cell: ({ row }) => <span className="text-gray-900">{row.original.account_name || "-"}</span>,
            },
            {
                id: "status",
                header: "Status",
                size: 110,
                enableSorting: false,
                accessorFn: (row) => STATUS_META[row.status]?.label ?? row.status,
                Cell: ({ row }) => {
                    const meta = STATUS_META[row.original.status];
                    return meta ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.pill}`}>
                            {meta.label}
                        </span>
                    ) : (
                        <span className="text-gray-500">{row.original.status}</span>
                    );
                },
            },
            {
                id: "first_message_preview",
                header: "First message",
                size: 240,
                enableSorting: false,
                accessorFn: (row) => row.first_message_preview ?? "",
                Cell: ({ row }) => (
                    <span className="block truncate text-gray-900" style={{ maxWidth: 240 }}>
                        {row.original.first_message_preview || row.original.subject || "-"}
                    </span>
                ),
            },
            {
                id: "message_count",
                header: "Messages",
                size: 100,
                enableSorting: false,
                accessorFn: (row) => row.message_count,
            },
            {
                id: "assigned_user_fullname",
                header: "Agent",
                size: 150,
                enableSorting: false,
                accessorFn: (row) => row.assigned_user_fullname ?? "",
                Cell: ({ row }) => <span className="text-gray-900">{row.original.assigned_user_fullname || "-"}</span>,
            },
            {
                id: CONTACT_CONVERSATION_SORT_COLUMN,
                header: "Created",
                size: 160,
                accessorFn: (row) => row.created_at,
                Cell: ({ row }) => format(new Date(row.original.created_at), "dd MMM yyyy, HH:mm"),
            },
            {
                id: "last_message_at",
                header: "Last message",
                size: 130,
                enableSorting: false,
                accessorFn: (row) => row.last_message_at ?? "",
                Cell: ({ row }) =>
                    row.original.last_message_at ? (
                        <Tooltip title={row.original.last_message_preview || ""} arrow>
                            <span className="text-gray-900">{formatRelativeTime(row.original.last_message_at)}</span>
                        </Tooltip>
                    ) : (
                        <span className="text-gray-400">-</span>
                    ),
            },
        ],
        []
    );

    const startButton = (
        <AppButton variantStyle="outline" startIcon={<Plus size={16} />} onClick={() => setIsStartOpen(true)}>
            Start conversation
        </AppButton>
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {data && !canOpen && (
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">
                    <Lock size={14} />
                    You don&apos;t have access to open conversations.
                </div>
            )}

            <SuperTable<ContactConversationItem>
                tableId="contact-conversations"
                entityLabel="conversation"
                data={data?.items ?? []}
                columns={columns}
                rowCount={data?.total ?? 0}
                // First load, and a new page or filter (the previous rows stay
                // as a placeholder until then), show the skeleton.
                isLoading={isLoading || (isFetching && isPlaceholderData)}
                isError={isError}
                errorMessage={error?.message}
                onRetry={() => refetch()}
                manualPagination
                manualSorting
                manualFiltering
                initialState={{ sorting: [{ id: CONTACT_CONVERSATION_SORT_COLUMN, desc: true }] }}
                resetPageKey={`${query.channel_type ?? ""}|${query.sort}|${query.limit}`}
                onStateChange={(state) => setQuery((prev) => nextContactConversationQuery(prev, state))}
                filters={[
                    {
                        id: "channel_type",
                        label: "Channel",
                        type: "select" as const,
                        options: CONTACT_CONVERSATION_CHANNEL_OPTIONS,
                    },
                ]}
                onRowClick={canOpen ? (row) => setOpenItem(row) : undefined}
                renderTopLeftToolbar={() => startButton}
                renderEmptyState={() => (
                    <EmptyState
                        icon={MessagesSquare}
                        title="No conversations yet"
                        description="Start a conversation with this contact from a connected WhatsApp or email account."
                        action={{ label: "Start conversation", onClick: () => setIsStartOpen(true), icon: <Plus size={16} /> }}
                    />
                )}
                features={{
                    pagination: "pages",
                    pageSizeOptions: CONTACT_CONVERSATION_PAGE_SIZES,
                    sorting: true,
                    globalFilter: false,
                    columnFilters: false,
                    rowSelection: "none",
                    columnVisibility: false,
                    densityToggle: false,
                    fullScreenToggle: false,
                }}
            />

            <ContactConversationDrawer contactId={contactId} item={openItem} onClose={() => setOpenItem(null)} />

            <AppDialog
                open={isStartOpen}
                onClose={() => setIsStartOpen(false)}
                title="Start conversation"
                maxWidth="sm"
                contentPadding={false}
            >
                <StartConversationPanel
                    contactId={contactId}
                    contactName={contactName}
                    startOpen
                    onCancel={() => setIsStartOpen(false)}
                    onStarted={() => {
                        setIsStartOpen(false);
                        queryClient.invalidateQueries({ queryKey: contactConversationsKey(contactId) });
                    }}
                />
            </AppDialog>
        </div>
    );
};

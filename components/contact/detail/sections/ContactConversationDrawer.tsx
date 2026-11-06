"use client";

import { Drawer, IconButton } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";

import MessageList from "@/components/omnichannel/MessageList";
import MessageInput from "@/components/omnichannel/MessageInput";
import { CHANNEL_META, STATUS_META } from "@/components/support/workspace/workspaceHelpers";
import { useConversation } from "@/lib/hooks/useOmnichannel";
import { useOmnichannelRealtime } from "@/lib/hooks/useOmnichannelRealtime";
import { contactConversationsKey } from "@/lib/hooks/useContacts";
import type { ContactConversationItem } from "@/lib/types/omnichannel";

interface ContactConversationDrawerProps {
    contactId: string;
    // The row that was clicked; null closes the drawer.
    item: ContactConversationItem | null;
    onClose: () => void;
}

// One conversation from the contact's Conversations table, opened beside it:
// the full history plus a reply box, so the agent never leaves the contact.
// Same data and hooks as the Workspace, so a reply here shows there at once.
export const ContactConversationDrawer = ({ contactId, item, onClose }: ContactConversationDrawerProps) => {
    const queryClient = useQueryClient();
    const conversationId = item?.id ?? "";
    const { data: conversation, isLoading, isError } = useConversation(conversationId);
    useOmnichannelRealtime(conversationId || undefined);

    const channelType = conversation?.channel_type ?? item?.channel_type;
    const status = conversation?.status ?? item?.status;
    const statusMeta = status ? STATUS_META[status] : undefined;

    return (
        <Drawer
            anchor="right"
            open={!!item}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: "100vw", sm: 560 } } }}
        >
            {item && (
                <div className="flex h-full flex-col">
                    <header className="flex items-start gap-3 border-b border-gray-200 px-4 py-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-[15px] font-bold text-gray-900">
                                {channelType ? CHANNEL_META[channelType]?.label ?? channelType : "Conversation"}
                                {item.account_name ? ` · ${item.account_name}` : ""}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {statusMeta && (
                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${statusMeta.pill}`}>
                                        {statusMeta.label}
                                    </span>
                                )}
                                <span>Started {format(new Date(item.created_at), "dd MMM yyyy, HH:mm")}</span>
                            </div>
                        </div>
                        <IconButton onClick={onClose} size="small" aria-label="Close">
                            <X className="h-5 w-5" />
                        </IconButton>
                    </header>

                    {isLoading || (!conversation && !isError) ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Loader2 className="animate-spin text-gray-400" size={28} />
                        </div>
                    ) : isError || !conversation ? (
                        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-500">
                            This conversation could not be loaded.
                        </div>
                    ) : (
                        <>
                            <div className="flex min-h-0 flex-1 flex-col bg-[#F7F8FB]">
                                <MessageList messages={conversation.messages} channelType={conversation.channel_type} />
                            </div>
                            <div className="border-t border-gray-100">
                                <MessageInput
                                    conversationId={conversation.id}
                                    channelType={conversation.channel_type}
                                    onMessageSent={() => {
                                        queryClient.invalidateQueries({
                                            queryKey: ["omnichannels", "conversations", conversation.id],
                                        });
                                        // Last message and message count in the table.
                                        queryClient.invalidateQueries({ queryKey: contactConversationsKey(contactId) });
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </Drawer>
    );
};

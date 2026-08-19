"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Mail, MessageCircle, MessagesSquare, Send } from "lucide-react";

import MessageList from "@/components/omnichannel/MessageList";
import MessageInput from "@/components/omnichannel/MessageInput";
import { EmptyState } from "@/components/ui/empty-state";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import {
    useAccounts,
    useConversation,
    useCreateConversation,
} from "@/lib/hooks/useOmnichannel";
import { useOmnichannelRealtime } from "@/lib/hooks/useOmnichannelRealtime";
import { fetchContactTimeline } from "@/lib/api/omnichannel";
import {
    OmnichannelContactTimelineConversation,
    OmnichannelContactTimelineResponse,
} from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

type ChatChannel = "whatsapp" | "email" | "web_widget";

const CHANNEL_LABELS: Record<ChatChannel, string> = {
    whatsapp: "WhatsApp",
    email: "Email",
    web_widget: "Web Chat",
};

interface ContactChannelChatProps {
    contactId: string;
    contactName?: string;
    // Restrict to one channel (the WhatsApp tab); omit to show all channels
    // with a toggle (the Conversations tab).
    channelType?: ChatChannel;
}

// Inline omnichannel conversation panel for the Contact detail page - the
// same "unified agent pane" idea TicketConversationPanel.tsx already ships
// for tickets, extended with a start-conversation flow so staff can open a
// brand-new WhatsApp/Email thread with this contact without leaving their
// profile. All data flows through the same Omnichannel endpoints/hooks the
// Unified Inbox itself uses, so anything sent here is immediately visible
// there and vice versa.
export const ContactChannelChat = ({
    contactId,
    contactName,
    channelType,
}: ContactChannelChatProps) => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const contactKey = `contact:${contactId}`;

    // The timeline 404s for a contact with no omnichannel history at all -
    // treated as "no conversations yet" (null), which renders the
    // start-conversation flow instead of an error.
    const timelineQuery = useQuery<OmnichannelContactTimelineResponse | null>({
        queryKey: ["omnichannels", "contact-chat", contactKey, channelType ?? "all"],
        queryFn: async () => {
            if (!token) throw new Error("No authentication token");
            try {
                return await fetchContactTimeline(token, contactKey, channelType);
            } catch {
                return null;
            }
        },
        staleTime: 1000 * 30,
        enabled: !!token,
    });

    const conversations = useMemo(
        () =>
            (timelineQuery.data?.conversations || []).filter(
                (c) => !channelType || c.channel_type === channelType
            ),
        [timelineQuery.data, channelType]
    );

    const availableChannels = useMemo(() => {
        const channels = new Set<ChatChannel>();
        conversations.forEach((c) => {
            if (
                c.channel_type === "whatsapp" ||
                c.channel_type === "email" ||
                c.channel_type === "web_widget"
            ) {
                channels.add(c.channel_type);
            }
        });
        return Array.from(channels);
    }, [conversations]);

    const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
    const activeChannel: ChatChannel | null =
        channelType ?? selectedChannel ?? availableChannels[0] ?? null;

    const activeConversation: OmnichannelContactTimelineConversation | undefined =
        useMemo(
            () =>
                conversations.find((c) => c.channel_type === activeChannel) ??
                conversations[0],
            [conversations, activeChannel]
        );

    const conversationId = activeConversation?.conversation_id;
    const conversationQuery = useConversation(conversationId || "");
    useOmnichannelRealtime(conversationId);

    if (timelineQuery.isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (!conversationId) {
        return (
            <StartConversationPanel
                contactId={contactId}
                contactName={contactName}
                channelType={channelType}
                onStarted={() => {
                    queryClient.invalidateQueries({
                        queryKey: ["omnichannels", "contact-chat", contactKey],
                    });
                }}
            />
        );
    }

    const conversation = conversationQuery.data;

    return (
        <div className="flex flex-col">
            {!channelType && availableChannels.length > 1 && (
                <div className="flex gap-1 border-b border-gray-100 px-4 py-2">
                    {availableChannels.map((channel) => (
                        <button
                            key={channel}
                            onClick={() => setSelectedChannel(channel)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                channel === activeChannel
                                    ? "bg-[#EEF2FD] text-[#5479EE]"
                                    : "text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            {channel === "whatsapp" ? (
                                <MessageCircle size={13} />
                            ) : channel === "web_widget" ? (
                                <Globe size={13} />
                            ) : (
                                <Mail size={13} />
                            )}
                            {CHANNEL_LABELS[channel]}
                        </button>
                    ))}
                </div>
            )}

            {conversationQuery.isLoading || !conversation ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <>
                    <div className="h-[440px] flex flex-col">
                        <MessageList
                            messages={conversation.messages}
                            channelType={conversation.channel_type}
                        />
                    </div>
                    <div className="border-t border-gray-100">
                        <MessageInput
                            conversationId={conversation.id}
                            channelType={conversation.channel_type}
                            onMessageSent={() => {
                                queryClient.invalidateQueries({
                                    queryKey: [
                                        "omnichannels",
                                        "conversations",
                                        conversation.id,
                                    ],
                                });
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

interface StartConversationPanelProps {
    contactId: string;
    contactName?: string;
    channelType?: ChatChannel;
    onStarted: () => void;
}

const StartConversationPanel = ({
    contactId,
    contactName,
    channelType,
    onStarted,
}: StartConversationPanelProps) => {
    const { data: accounts } = useAccounts(channelType);
    const createConversation = useCreateConversation();

    const eligibleAccounts = useMemo(
        () =>
            (accounts || []).filter(
                (a) => a.channel_type === "whatsapp" || a.channel_type === "email"
            ),
        [accounts]
    );

    const [accountId, setAccountId] = useState("");
    const [message, setMessage] = useState("");
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    // Default to the only connected account when there's exactly one.
    const effectiveAccountId =
        accountId || (eligibleAccounts.length === 1 ? eligibleAccounts[0].id : "");

    const handleStart = async () => {
        if (!effectiveAccountId) {
            notify.warning("Select an account", {
                description: "Choose which connected account to send from.",
            });
            return;
        }
        if (!message.trim()) {
            notify.warning("Empty message", {
                description: "Write an opening message to start the conversation.",
            });
            return;
        }
        try {
            await createConversation.mutateAsync({
                account_id: effectiveAccountId,
                contact_id: contactId,
                name: contactName || "",
                message: message.trim(),
            });
            notify.success("Conversation started");
            setMessage("");
            setIsComposerOpen(false);
            onStarted();
        } catch (error) {
            handleError(error, "Failed to start the conversation");
        }
    };

    if (!isComposerOpen) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={MessagesSquare}
                    title="No conversations yet"
                    description={
                        channelType
                            ? `Start a ${channelType === "whatsapp" ? "WhatsApp" : "email"} conversation with this contact from a connected account.`
                            : "Start a conversation with this contact from a connected WhatsApp or email account."
                    }
                    action={{
                        label: "Start conversation",
                        onClick: () => setIsComposerOpen(true),
                        icon: <Send size={16} />,
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-6">
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                    Send from
                </label>
                <select
                    value={effectiveAccountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                >
                    <option value="">Select a connected account...</option>
                    {eligibleAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.display_name || account.channel_identifier} (
                            {account.channel_type})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Write an opening message..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                />
            </div>
            <div className="flex justify-end gap-2">
                <AppButton
                    variantStyle="outline"
                    color="gray"
                    onClick={() => setIsComposerOpen(false)}
                    disabled={createConversation.isPending}
                >
                    Cancel
                </AppButton>
                <AppButton
                    onClick={handleStart}
                    isLoading={createConversation.isPending}
                    startIcon={<Send size={16} />}
                >
                    Send
                </AppButton>
            </div>
        </div>
    );
};

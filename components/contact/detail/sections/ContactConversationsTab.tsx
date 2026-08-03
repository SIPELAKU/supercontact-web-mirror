import Link from "next/link";
import { Mail, MessageCircle, MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface Conversation {
    id: string;
    channel_type: "whatsapp" | "email";
    status: "open" | "closed" | "archived";
    last_message_at: string | null;
    last_message_preview: string | null;
}

interface ContactConversationsTabProps {
    conversations: Conversation[];
}

const STATUS_STYLES: Record<Conversation["status"], string> = {
    open: "bg-emerald-50 text-emerald-700",
    closed: "bg-gray-100 text-gray-500",
    archived: "bg-gray-100 text-gray-400",
};

const formatTimestamp = (value: string | null) => {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "-";
    }
};

export const ContactConversationsTab = ({ conversations }: ContactConversationsTabProps) => {
    if (conversations.length === 0) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={MessagesSquare}
                    title="No conversations yet"
                    description="Conversations from Unified Inbox (WhatsApp or Email) with this contact will show up here."
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-gray-100 p-2">
            {conversations.map((convo) => (
                <Link
                    key={convo.id}
                    href={`/omnichannel/conversations/${convo.id}`}
                    className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-gray-50"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FD] text-[#5479EE]">
                        {convo.channel_type === "whatsapp" ? (
                            <MessageCircle size={18} />
                        ) : (
                            <Mail size={18} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold capitalize text-gray-900">
                                {convo.channel_type}
                            </span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[convo.status]}`}
                            >
                                {convo.status}
                            </span>
                        </div>
                        <p className="truncate text-sm text-gray-500">
                            {convo.last_message_preview || "No messages yet"}
                        </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                        {formatTimestamp(convo.last_message_at)}
                    </span>
                </Link>
            ))}
        </div>
    );
};

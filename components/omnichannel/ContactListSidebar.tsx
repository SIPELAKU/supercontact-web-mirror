"use client";

import React from "react";
import { Search, UserPlus, X, Loader2, Flame, Mail, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { ContactReq } from "@/lib/models/types";
import { OmnichannelContact } from "@/lib/types/omnichannel";
import { CircularProgress } from "@mui/material";

export type ContactListChannelFilter = "all" | "whatsapp" | "email";

interface ContactListSidebarProps {
    contacts: OmnichannelContact[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    channelFilter: ContactListChannelFilter;
    onChannelFilterChange: (filter: ContactListChannelFilter) => void;
    // Last-activity window in days; 0 = all time.
    timeFilter: number;
    onTimeFilterChange: (days: number) => void;
    selectedContactId?: string;
    onSelectContact: (contact: OmnichannelContact) => void;
    onRefresh: () => void;
    onFullSync: () => void;
    isRefreshPending: boolean;
    isNewContactOpen: boolean;
    onToggleNewContact: (open: boolean) => void;
    newContact: ContactReq;
    onNewContactChange: (contact: ContactReq) => void;
    onCreateContact: (e: React.FormEvent) => void;
    isSubmittingContact: boolean;
}

// Column 1 of the Omnichannel 3-column layout: search, refresh/full-sync,
// new-contact form toggle, and the contact list itself. Hidden on mobile
// once a contact is selected so column 2 (the conversation) gets the full
// screen - mirrors components/inbox/ChatSidebar.tsx's `md:` pattern.
const CHANNEL_FILTERS: { value: ContactListChannelFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
];

const TIME_FILTERS: { value: number; label: string; title: string }[] = [
    { value: 0, label: "All time", title: "No time filter" },
    { value: 1, label: "1D", title: "Active in the last day" },
    { value: 7, label: "1W", title: "Active in the last week" },
    { value: 30, label: "1M", title: "Active in the last month" },
];

export default function ContactListSidebar({
    contacts,
    isLoading,
    searchTerm,
    onSearchChange,
    channelFilter,
    onChannelFilterChange,
    timeFilter,
    onTimeFilterChange,
    selectedContactId,
    onSelectContact,
    onRefresh,
    onFullSync,
    isRefreshPending,
    isNewContactOpen,
    onToggleNewContact,
    newContact,
    onNewContactChange,
    onCreateContact,
    isSubmittingContact,
}: ContactListSidebarProps) {
    return (
        <div
            className={cn(
                "w-full md:w-80 border border-gray-200 shadow-lg rounded-2xl flex-col shrink-0 z-10 bg-white",
                selectedContactId ? "hidden md:flex" : "flex"
            )}
        >
            <div className="p-4 border-b border-gray-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <AppInput
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        startIcon={<Search />}
                        className="flex-1"
                        isBgWhite
                    />
                </div>
                {/* Channel category tabs - server-side filter, so recency
                    ordering stays correct within each category. */}
                <div className="flex gap-1 rounded-full bg-gray-100 p-1">
                    {CHANNEL_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => onChannelFilterChange(filter.value)}
                            className={cn(
                                "flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                                channelFilter === filter.value
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                {/* Last-activity window - also server-side, composes with the
                    channel filter above. */}
                <div className="flex gap-1 rounded-full bg-gray-100 p-1">
                    {TIME_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => onTimeFilterChange(filter.value)}
                            title={filter.title}
                            className={cn(
                                "flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                                timeFilter === filter.value
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                {!isNewContactOpen && contacts.length > 0 && (
                    <AppButton
                        fullWidth
                        onClick={() => onToggleNewContact(true)}
                        startIcon={<UserPlus />}
                    >
                        New Contact
                    </AppButton>
                )}
                <div className="flex items-center gap-2 w-full mt-2">
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        className="flex-1 text-[11px] h-8 px-2 border-gray-200 text-gray-500 hover:text-gray-700 font-semibold"
                        onClick={onRefresh}
                        disabled={isRefreshPending}
                    >
                        {isRefreshPending ? "Refreshing..." : "Refresh"}
                    </AppButton>
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        className="flex-1 text-[11px] h-8 px-2 border-gray-200 text-gray-500 hover:text-gray-700 font-semibold"
                        onClick={onFullSync}
                        disabled={isRefreshPending}
                    >
                        Full Sync
                    </AppButton>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* CREATE CONTACT FORM */}
                {isNewContactOpen && (
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 animate-in slide-in-from-top duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Create Contact</h3>
                            <button
                                onClick={() => onToggleNewContact(false)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={onCreateContact} className="space-y-3">
                            <AppInput
                                size="small"
                                placeholder="Name"
                                value={newContact.name}
                                onChange={e => onNewContactChange({ ...newContact, name: e.target.value })}
                                fullWidth
                                isBgWhite
                            />
                            <div className="flex gap-2 pt-3">
                                <AppInput
                                    size="small"
                                    placeholder="Email"
                                    value={newContact.email}
                                    onChange={e => onNewContactChange({ ...newContact, email: e.target.value })}
                                    fullWidth
                                    isBgWhite
                                />
                                <AppInput
                                    size="small"
                                    placeholder="Phone"
                                    value={newContact.phone_number}
                                    onChange={e => onNewContactChange({ ...newContact, phone_number: e.target.value })}
                                    fullWidth
                                    isBgWhite
                                />
                            </div>
                            <div className="flex gap-2">
                                <AppInput
                                    size="small"
                                    placeholder="Company"
                                    value={newContact.company || ""}
                                    onChange={e => onNewContactChange({ ...newContact, company: e.target.value })}
                                    fullWidth
                                    isBgWhite
                                />
                                <AppInput
                                    size="small"
                                    placeholder="Position"
                                    value={newContact.position}
                                    onChange={e => onNewContactChange({ ...newContact, position: e.target.value })}
                                    fullWidth
                                    isBgWhite
                                />
                            </div>
                            <AppTextarea
                                placeholder="Address"
                                value={newContact.address || ""}
                                onChange={e => onNewContactChange({ ...newContact, address: e.target.value })}
                                fullWidth
                                isBgWhite
                                rows={2}
                            />
                            <div className="flex gap-2 pt-3">
                                <AppButton
                                    type="button"
                                    variantStyle="outline"
                                    color="gray"
                                    className="flex-1 text-xs py-1"
                                    onClick={() => onToggleNewContact(false)}
                                >
                                    Cancel
                                </AppButton>
                                <AppButton
                                    type="submit"
                                    className="flex-1 text-xs py-1"
                                    disabled={isSubmittingContact}
                                >
                                    {isSubmittingContact ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                                </AppButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* CONTACT LIST */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                        <CircularProgress />
                        <p className="text-sm">Loading contacts...</p>
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {contacts.map((contact: OmnichannelContact, index: number) => {
                            // The API orders active conversations first (by
                            // recency), then contacts with no conversation yet
                            // - surface that grouping with one divider at the
                            // boundary instead of leaving it implicit.
                            const isFirstWithoutConversation =
                                !contact.last_message_at &&
                                (index === 0 || !!contacts[index - 1]?.last_message_at);
                            return (
                                <React.Fragment key={contact.contact_id}>
                                {isFirstWithoutConversation && (
                                    <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/60">
                                        No conversations yet
                                    </div>
                                )}
                                <div
                                    onClick={() => onSelectContact(contact)}
                                    className={cn(
                                        "p-4 cursor-pointer transition-all hover:bg-gray-200 group flex items-start gap-3 border-b border-gray-50",
                                        selectedContactId === contact.contact_id ? "bg-blue-50/50" : ""
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
                                        {contact.display_name ? contact.display_name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "?"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate text-sm">{contact.display_name}</h4>
                                                {contact.is_frequent && (
                                                    <span
                                                        className="inline-flex items-center shrink-0"
                                                        title={`Frequent contact — ${contact.frequent_message_count ?? 0} messages in the last 30 days`}
                                                    >
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                    </span>
                                                )}
                                            </div>
                                            {contact.last_message_at && (
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(contact.last_message_at), { addSuffix: false })
                                                        .replace('about ', '')
                                                        .replace('less than a minute', 'now')
                                                        .replace('minute', 'm')
                                                        .replace('minutes', 'm')
                                                        .replace('hour', 'h')
                                                        .replace('hours', 'h')
                                                        .replace('day', 'd')
                                                        .replace('days', 'd')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-0.5">
                                            <p className="text-xs text-gray-500 truncate flex-1">
                                                {contact.last_message_preview || contact.primary_identifier || "No contact info"}
                                            </p>
                                            <span className="ml-2 flex items-center gap-1 shrink-0">
                                                {contact.channel_types?.includes("whatsapp") && (
                                                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                                                )}
                                                {contact.channel_types?.includes("email") && (
                                                    <Mail className="w-3 h-3 text-blue-400" />
                                                )}
                                                {contact.unread_count > 0 && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-sm">
                                                        {contact.unread_count > 99 ? '99+' : contact.unread_count}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        className="border-none bg-transparent rounded-none py-16 px-6"
                        icon={UserPlus}
                        title={`No contacts found for "${searchTerm}"`}
                        description="Try a different search term or add a new contact."
                        action={{
                            label: "New Contact",
                            onClick: () => onToggleNewContact(true),
                            icon: <UserPlus />,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

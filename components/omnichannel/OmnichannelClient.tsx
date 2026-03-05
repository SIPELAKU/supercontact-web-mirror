"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    UserPlus,
    X,
    Trash2,
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Building,
    Loader2,
    Trash,
    Paperclip,
    Send,
    File as FileIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppButton } from "@/components/ui/app-button";
import { cn } from "@/lib/utils";
import { useAllContacts } from "@/lib/hooks/useContacts";
import {
    useInbox,
    useConversation,
    useSendMessage,
    useDeleteConversation,
    useAccounts,
    useCreateConversation,
    useMarkAsRead,
    useUploadMedia
} from "@/lib/hooks/useOmnichannel";
import { Contact, ContactReq } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "../ui/page-header";
import { CircularProgress } from "@mui/material";
import MessageList from "./MessageList";

export default function OmnichannelClient() {
    const { getToken } = useAuth();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isNewContactOpen, setIsNewContactOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState<"whatsapp" | "email">("whatsapp");

    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [inputText, setInputText] = useState("");
    const [isChannelSelected, setIsChannelSelected] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Handle file trigger
    const handleFileTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Contacts and Inbox data
    const { data: contactsData, isLoading: isLoadingContacts, refetch: refetchContacts } = useAllContacts();
    const { data: inboxData } = useInbox(chatMode);
    const { data: accounts } = useAccounts();
    const createConversationMutation = useCreateConversation();

    // Selected conversation data
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const { data: conversation, isLoading: isLoadingConversation } = useConversation(activeConversationId || "");

    // Mutations
    const sendMessageMutation = useSendMessage();
    const deleteConversationMutation = useDeleteConversation();
    const markAsReadMutation = useMarkAsRead();
    const uploadMediaMutation = useUploadMedia();

    // New Contact Form State
    const [newContact, setNewContact] = useState<ContactReq>({
        name: "",
        email: "",
        phone_number: "",
        company: "",
        position: "",
        address: "",
    });
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);

    // Filtered contacts based on search
    const filteredContacts = useMemo(() => {
        if (!contactsData?.data?.contacts) return [];
        const search = searchTerm.toLowerCase();

        // Initial filter by search term
        let filtered = contactsData.data.contacts.filter((c: any) =>
            (c.name && c.name.toLowerCase().includes(search)) ||
            (c.email && c.email.toLowerCase().includes(search)) ||
            (c.phone && c.phone.toLowerCase().includes(search)) ||
            (c.phone_number && c.phone_number.toLowerCase().includes(search))
        );

        // Sort by inbox order if inboxData exists
        if (inboxData && Array.isArray(inboxData)) {
            const inbox = inboxData as any[];
            const conversationMap = new Map();

            // Map contact_id to its index in inboxData for quick sorting
            inbox.forEach((conv, index) => {
                if (conv.contact_id) {
                    // Only store the first occurrence (most recent) if a contact has multiple convs
                    if (!conversationMap.has(conv.contact_id)) {
                        conversationMap.set(conv.contact_id, index);
                    }
                }
            });

            filtered = [...filtered].sort((a: any, b: any) => {
                const indexA = conversationMap.has(a.id) ? conversationMap.get(a.id) : 999999;
                const indexB = conversationMap.has(b.id) ? conversationMap.get(b.id) : 999999;

                // If both are in inbox, sort by inbox index
                // If only one is in inbox, it comes first
                // If neither are in inbox, maintain original order (or could sort by name)
                if (indexA !== indexB) {
                    return indexA - indexB;
                }

                // Secondary sort: alphabet by name for contacts not in inbox
                return (a.name || "").localeCompare(b.name || "");
            });
        }

        return filtered;
    }, [contactsData, searchTerm, inboxData, chatMode]);

    // Auto-select conversation when chatMode or selectedContact changes
    useEffect(() => {
        if (selectedContact && inboxData && Array.isArray(inboxData)) {
            const contactIdentifier = (selectedContact as any).phone || selectedContact.phone_number || selectedContact.email;
            const existingConv = (inboxData as any[]).find(c =>
                c.contact_identifier === contactIdentifier ||
                c.external_contact_identifier === contactIdentifier ||
                c.contact_id === selectedContact.id
            );

            if (existingConv) {
                setActiveConversationId(existingConv.id);
            } else {
                setActiveConversationId(null);
            }
        } else if (!selectedContact) {
            setActiveConversationId(null);
        }
    }, [chatMode, selectedContact, inboxData]);

    // Mark conversation as read when it's opened and has unread messages
    useEffect(() => {
        if (conversation && conversation.unread_count > 0) {
            markAsReadMutation.mutate(conversation.id);
        }
    }, [conversation]);

    // Handle contact selection
    const handleSelectContact = (contact: any) => {
        setSelectedContact(contact);
        setIsChannelSelected(false);
    };

    const handleCreateContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.name) {
            notify.warning("Name is required");
            return;
        }

        setIsSubmittingContact(true);
        try {
            const token = await getToken();
            const res = await fetch("/api/proxy/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newContact),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw errorData || new Error("Failed to create contact");
            }

            notify.success("Contact created successfully");
            setIsNewContactOpen(false);
            setNewContact({
                name: "",
                email: "",
                phone_number: "",
                company: "",
                position: "",
                address: "",
            });
            refetchContacts();
        } catch (error) {
            notify.error("Error", {
                description: handleError(error, "Create Contact"),
            });
        } finally {
            setIsSubmittingContact(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const content = chatMode === "whatsapp" ? inputText : emailBody;

        if (!selectedFile && !content.trim()) return;

        // Validation for Media Upload (WhatsApp)
        if (chatMode === "whatsapp" && selectedFile) {
            if (!inputText.trim()) {
                notify.error("Media must have a description in English");
                return;
            }
        }

        try {
            let conversationId = activeConversationId;
            if (!conversationId) {
                // Create new conversation first
                if (!selectedContact) return;

                const accountId = accounts?.find(a => a.channel_type === chatMode)?.id;
                if (!accountId) {
                    notify.error(`No active ${chatMode} account found`);
                    return;
                }

                const newConv = await createConversationMutation.mutateAsync({
                    account_id: accountId,
                    to: (selectedContact as any).phone || (selectedContact as any).phone_number || (selectedContact as any).email,
                    name: selectedContact.name,
                    subject: emailSubject,
                    message: content,
                });
                conversationId = newConv.id;
                setActiveConversationId(conversationId);

                // If it's media, we still need to upload it to the new conversation
                if (chatMode === "whatsapp" && selectedFile) {
                    await uploadMediaMutation.mutateAsync({
                        conversationId,
                        file: selectedFile,
                        content: inputText,
                    });
                    handleRemoveFile();
                    setInputText("");
                }
            } else {
                // Send to existing conversation
                if (chatMode === "whatsapp" && selectedFile) {
                    await uploadMediaMutation.mutateAsync({
                        conversationId,
                        file: selectedFile,
                        content: inputText,
                    });
                    handleRemoveFile();
                    setInputText("");
                } else {
                    await sendMessageMutation.mutateAsync({
                        conversationId,
                        content: content,
                    });
                    if (chatMode === "whatsapp") setInputText("");
                    else setEmailBody("");
                }
            }
            if (chatMode === "email") setEmailSubject("");
        } catch (error) {
            notify.error(handleError(error, "Send Message"));
        }
    };

    const handleDeleteConversation = async () => {
        if (!activeConversationId) return;
        if (!confirm("Are you sure you want to delete this conversation?")) return;

        try {
            await deleteConversationMutation.mutateAsync(activeConversationId);
            setActiveConversationId(null);
            notify.success("Conversation deleted");
        } catch (error) {
            notify.error(handleError(error, "Delete Conversation"));
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <PageHeader
                title="Omnichannel Inbox"
                description="Manage all your conversations in one place"
                breadcrumbs={[
                    { label: "Home", href: "/dashboard" },
                    { label: "Omnichannel" },
                ]}
            />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white gap-3">
                {/* Column 1: Contacts sidebar */}
                <div className="w-80 border border-gray-200 shadow-lg rounded-2xl flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 flex flex-col gap-2">
                        <AppInput
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search />}
                        />
                        {!isNewContactOpen && filteredContacts.length > 0 && (
                            <AppButton
                                fullWidth
                                onClick={() => setIsNewContactOpen(true)}
                                startIcon={<UserPlus />}
                            >
                                New Contact
                            </AppButton>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* CREATE CONTACT FORM */}
                        {isNewContactOpen && (
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 animate-in slide-in-from-top duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">Create Contact</h3>
                                    <button
                                        onClick={() => setIsNewContactOpen(false)}
                                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateContact} className="space-y-3">
                                    <AppInput
                                        size="small"
                                        placeholder="Name"
                                        value={newContact.name}
                                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                        fullWidth
                                        isBgWhite
                                    />
                                    <div className="flex gap-2 pt-3">
                                        <AppInput
                                            size="small"
                                            placeholder="Email"
                                            value={newContact.email}
                                            onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                            fullWidth
                                            isBgWhite
                                        />
                                        <AppInput
                                            size="small"
                                            placeholder="Phone"
                                            value={newContact.phone_number}
                                            onChange={e => setNewContact({ ...newContact, phone_number: e.target.value })}
                                            fullWidth
                                            isBgWhite
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <AppInput
                                            size="small"
                                            placeholder="Company"
                                            value={newContact.company || ""}
                                            onChange={e => setNewContact({ ...newContact, company: e.target.value })}
                                            fullWidth
                                            isBgWhite
                                        />
                                        <AppInput
                                            size="small"
                                            placeholder="Position"
                                            value={newContact.position}
                                            onChange={e => setNewContact({ ...newContact, position: e.target.value })}
                                            fullWidth
                                            isBgWhite
                                        />
                                    </div>
                                    <AppTextarea
                                        placeholder="Address"
                                        value={newContact.address || ""}
                                        onChange={e => setNewContact({ ...newContact, address: e.target.value })}
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
                                            onClick={() => setIsNewContactOpen(false)}
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
                        {isLoadingContacts ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                                <CircularProgress />
                                <p className="text-sm">Loading contacts...</p>
                            </div>
                        ) : filteredContacts.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {filteredContacts.map((contact: any) => {
                                    // Find conversation for this contact to show unread count and time
                                    const contactIdentifier = contact.phone || contact.phone_number || contact.email;
                                    const conv = (inboxData as any)?.find((c: any) =>
                                        c.contact_id === contact.id ||
                                        c.external_contact_identifier === contactIdentifier
                                    );

                                    return (
                                        <div
                                            key={contact.id}
                                            onClick={() => handleSelectContact(contact)}
                                            className={cn(
                                                "p-4 cursor-pointer transition-all hover:bg-gray-200 group flex items-start gap-3 border-b border-gray-50",
                                                selectedContact?.id === contact.id ? "bg-blue-50/50" : ""
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
                                                {contact.name ? contact.name.split(' ').filter(Boolean).map((n: any[]) => n[0]).join('').slice(0, 2).toUpperCase() : "?"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 truncate text-sm">{contact.name}</h4>
                                                    {conv && conv.last_message_at && (
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
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
                                                        {(contact as any).phone || (contact as any).phone_number || contact.email || "No contact info"}
                                                    </p>
                                                    {conv && (conv.unread_count > 0) && (
                                                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-sm">
                                                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <UserPlus className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">No contacts found for "{searchTerm}"</p>
                                <p className="text-xs text-gray-400 mb-6">Try a different search term or add a new contact.</p>
                                <AppButton
                                    fullWidth
                                    onClick={() => setIsNewContactOpen(true)}
                                    startIcon={<UserPlus />}
                                >
                                    New Contact
                                </AppButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FC] border border-gray-200 shadow-lg rounded-2xl">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-[72px] px-6 border-b border-gray-100 rounded-2xl bg-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="hidden sm:block">
                                        <h3 className="font-bold text-gray-900 truncate flex items-center gap-2 text-base">
                                            {selectedContact.name}
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 border border-gray-200 flex items-center gap-1 uppercase tracking-wider">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                No Sentiment
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {(activeConversationId || isChannelSelected) && (
                                                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                                    <button
                                                        onClick={() => setChatMode("whatsapp")}
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                                            chatMode === "whatsapp" ? "bg-white text-primary shadow-sm border border-gray-200/50" : "text-gray-400 hover:text-gray-600"
                                                        )}
                                                    >
                                                        <MessageCircle className="w-3 h-3" />
                                                        WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={() => setChatMode("email")}
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                                            chatMode === "email" ? "bg-white text-primary shadow-sm border border-gray-200/50" : "text-gray-400 hover:text-gray-600"
                                                        )}
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        Email
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 ml-2">
                                                <span className="text-xs text-gray-400">Phone: {(selectedContact as any).phone || (selectedContact as any).phone_number || "-"}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="text-xs text-gray-400">Email: {selectedContact.email || "-"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDeleteConversation}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete conversation"
                                        disabled={!activeConversationId || deleteConversationMutation.isPending}
                                    >
                                        {deleteConversationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                                        title={isSidebarOpen ? "Close details" : "Open details"}
                                    >
                                        {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Chat Content */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-[#F0F2F5]">
                                {!activeConversationId ? (
                                    <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FC]">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                            <MessageCircle className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-500 mb-8">No messages in this conversation yet</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                            <button
                                                onClick={() => { setChatMode("whatsapp"); setIsChannelSelected(true); }}
                                                className="p-6 bg-[#F0FDF4] rounded-2xl cursor-pointer border-2 border-transparent hover:border-green-200 transition-all group text-center flex flex-col items-center"
                                            >
                                                <div className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-green-200 group-hover:scale-110 transition-transform">
                                                    <MessageCircle className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">Start WhatsApp Conversation</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed">Open a direct WhatsApp thread for this contact</p>
                                            </button>

                                            <button
                                                onClick={() => { setChatMode("email"); setIsChannelSelected(true); }}
                                                className="p-6 bg-[#FFF5F7] rounded-2xl cursor-pointer border-2 border-transparent hover:border-pink-200 transition-all group text-center flex flex-col items-center"
                                            >
                                                <div className="w-12 h-12 bg-[#E91E63] text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
                                                    <Mail className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">Start Email Conversation</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed">Create a new email thread with subject and recipients</p>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cn("flex-1 min-h-0 flex flex-col", (!conversation || isLoadingConversation) && "items-center justify-center")}>
                                        {isLoadingConversation ? (
                                            <CircularProgress />
                                        ) : conversation ? (
                                            <MessageList messages={conversation.messages} channelType={conversation.channel_type} />
                                        ) : (
                                            <p className="text-gray-400 text-sm">Select a contact to start chatting</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            {(activeConversationId || isChannelSelected) && (
                                <div className="p-4 bg-white border-t border-gray-100">
                                    {/* Input logic based on chatMode */}
                                    {chatMode === "whatsapp" ? (
                                        <div className="flex items-center gap-2 p-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleFileTrigger}
                                                className="p-2 text-gray-400 hover:text-primary cursor-pointer transition-all shrink-0"
                                            >
                                                <Paperclip className="w-5 h-5" />
                                            </button>

                                            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                                                <div className="flex-1 relative group rounded-[28px] border border-gray-300 overflow-hidden">
                                                    {selectedFile && (
                                                        <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                                            {previewUrl ? (
                                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                                                    <FileIcon className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                                                <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveFile}
                                                                className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <AppTextarea
                                                        placeholder="Type a message..."
                                                        value={inputText}
                                                        isBgWhite
                                                        rounded="28px"
                                                        onChange={(e) => setInputText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleSendMessage();
                                                            }
                                                        }}
                                                        className="w-full bg-transparent focus:bg-white transition-all shadow-none"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                minHeight: "44px",
                                                                padding: "8px 16px",
                                                                "& fieldset": { border: "none" }
                                                            }
                                                        }}
                                                        rows={1}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!inputText.trim() || sendMessageMutation.isPending || createConversationMutation.isPending || uploadMediaMutation.isPending}
                                                    className="w-11 h-11 bg-transparent text-green-500 hover:text-white border border-green-500 rounded-full flex items-center justify-center hover:bg-green-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                                                >
                                                    {(sendMessageMutation.isPending || createConversationMutation.isPending || uploadMediaMutation.isPending) ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        <Send className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                            <div className="p-2 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 text-right">To</span>
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-600"
                                                        defaultValue={selectedContact.email || ""}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 text-right">Subject</span>
                                                    <input
                                                        type="text"
                                                        value={emailSubject}
                                                        onChange={(e) => setEmailSubject(e.target.value)}
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 font-semibold text-gray-700"
                                                        placeholder="Enter subject..."
                                                    />
                                                </div>
                                            </div>
                                            <AppTextarea
                                                placeholder="Write an email reply..."
                                                value={emailBody}
                                                onChange={(e) => setEmailBody(e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none p-4 min-h-[120px] text-gray-700"
                                            />
                                            <div className="p-2 flex justify-end">
                                                <button
                                                    onClick={() => handleSendMessage()}
                                                    disabled={!emailBody.trim() || sendMessageMutation.isPending || createConversationMutation.isPending}
                                                    className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    {(sendMessageMutation.isPending || createConversationMutation.isPending) ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                                    Send Email
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-medium">
                                        Sending via {chatMode === "whatsapp" ? "WhatsApp Business API" : "SMTP Relay"}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
                            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <MessageCircle className="w-12 h-12 text-gray-200" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Omnichannel Inbox</h2>
                            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                                Select a contact from the left list to start a conversation via WhatsApp or Email.
                                Manage all your communications in one powerful interface.
                            </p>
                        </div>
                    )}
                </div>

                {/* Column 3: Contact Details sidebar */}
                {selectedContact && isSidebarOpen && (
                    <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300 shadow-xl sm:shadow-none">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wider">Contact Details</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <DetailItem label="Name" value={selectedContact.name} icon={<UserPlus className="w-4 h-4" />} />
                            <DetailItem label="Email" value={selectedContact.email || "-"} icon={<Mail className="w-4 h-4" />} />
                            <DetailItem label="Phone" value={(selectedContact as any).phone || (selectedContact as any).phone_number || "-"} icon={<Phone className="w-4 h-4" />} />
                            <DetailItem label="Company" value={selectedContact.company || "-"} icon={<Building className="w-4 h-4" />} />
                            <DetailItem label="Position" value={(selectedContact as any).job_title || (selectedContact as any).position || "-"} icon={<Briefcase className="w-4 h-4" />} />
                            <DetailItem label="Address" value={selectedContact.address || "-"} icon={<MapPin className="w-4 h-4" />} />

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Open Conversations</p>
                                    <p className="text-2xl font-black text-gray-900">0</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Unread</p>
                                    <p className="text-2xl font-black text-primary">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                {label}
            </div>
            <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700">
                {value}
            </div>
        </div>
    );
}

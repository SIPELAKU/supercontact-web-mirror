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
    Send,
    File as FileIcon,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link2,
    Image as ImageIcon,
    Quote,
    Trash,
    Paperclip,
    Settings
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppButton } from "@/components/ui/app-button";
import { cn } from "@/lib/utils";
import {
    useInbox,
    useConversation,
    useSendMessage,
    useDeleteConversation,
    useAccounts,
    useCreateConversation,
    useMarkAsRead,
    useUploadMedia,
    useOmnichannelContacts,
    useRefreshEmail
} from "@/lib/hooks/useOmnichannel";
import { ContactReq } from "@/lib/models/types";
import { OmnichannelContact } from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "../ui/page-header";
import { CircularProgress } from "@mui/material";
import MessageList from "./MessageList";
import RichTextToolbar from "../email-marketing/campaigns/RichTextToolbar";

export default function OmnichannelClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const [selectedContact, setSelectedContact] = useState<OmnichannelContact | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isNewContactOpen, setIsNewContactOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState<"whatsapp" | "email">("whatsapp");
    const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

    const [emailSubject, setEmailSubject] = useState("");
    const [emailCc, setEmailCc] = useState("");
    const [emailBcc, setEmailBcc] = useState("");
    const [emailHtmlContent, setEmailHtmlContent] = useState("");
    const [inputText, setInputText] = useState("");
    const [isChannelSelected, setIsChannelSelected] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const emailEditorRef = React.useRef<HTMLDivElement>(null);

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

    const execCommand = (command: string, value: string = "") => {
        document.execCommand(command, false, value);
        if (emailEditorRef.current) {
            setEmailHtmlContent(emailEditorRef.current.innerHTML);
        }
    };

    // Contacts and Inbox data
    const { data: omnichannelContactsData, isLoading: isLoadingContacts, refetch: refetchContacts } = useOmnichannelContacts(searchTerm);
    const { data: inboxData } = useInbox(chatMode);
    const { data: accounts } = useAccounts();
    const createConversationMutation = useCreateConversation();

    // Selected conversation data
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const { data: conversation, isLoading: isLoadingConversation } = useConversation(activeConversationId || "");

    // Deep-link support: ?conversation=<id> (used by the notification panel to jump
    // straight to a conversation). This page only exposes conversations through the
    // contact list on the left, so we resolve the conversation's contact identifier,
    // search for it, then select it exactly like a normal manual click would.
    const conversationParam = searchParams.get("conversation");
    const [pendingDeepLinkConversationId, setPendingDeepLinkConversationId] = useState<string | null>(null);
    const { data: deepLinkConversation, isError: isDeepLinkConversationError } = useConversation(
        pendingDeepLinkConversationId || ""
    );

    // Re-arm the resolver whenever the URL's conversation param actually changes -
    // e.g. clicking a different notification while already on this page (the page
    // stays mounted, so a mount-only initializer would miss this).
    useEffect(() => {
        if (conversationParam) {
            setPendingDeepLinkConversationId(conversationParam);
        }
    }, [conversationParam]);

    // Mutations
    const sendMessageMutation = useSendMessage();
    const deleteConversationMutation = useDeleteConversation();
    const markAsReadMutation = useMarkAsRead();
    const uploadMediaMutation = useUploadMedia();
    const refreshEmailMutation = useRefreshEmail();

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
        return omnichannelContactsData?.contacts || [];
    }, [omnichannelContactsData]);

    // Auto-select conversation when chatMode or selectedContact changes
    useEffect(() => {
        if (selectedContact && inboxData && Array.isArray(inboxData)) {
            const contactIdentifier = selectedContact.phone_number || selectedContact.email;

            const existingConv = (inboxData as any[]).find((c: any) =>
                c.contact_identifier === contactIdentifier ||
                c.external_contact_identifier === contactIdentifier ||
                c.contact_id === selectedContact.contact_id
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
    const handleSelectContact = (contact: OmnichannelContact) => {
        setSelectedContact(contact);
        setIsChannelSelected(false);
        // Set default chat mode based on available channels
        if (contact.channel_types.length > 0) {
            if (!contact.channel_types.includes(chatMode)) {
                setChatMode(contact.channel_types[0]);
            }
        }
    };

    // Deep-link step 1: once the target conversation loads, search contacts by its
    // identifier so the owning contact surfaces in the (possibly paginated) list.
    useEffect(() => {
        if (!pendingDeepLinkConversationId) return;
        if (isDeepLinkConversationError) {
            setPendingDeepLinkConversationId(null);
            return;
        }
        if (!deepLinkConversation) return;
        const identifier = deepLinkConversation.contact_identifier || deepLinkConversation.external_contact_identifier;
        if (identifier && identifier !== searchTerm) {
            setSearchTerm(identifier);
        }
    }, [pendingDeepLinkConversationId, deepLinkConversation, isDeepLinkConversationError]);

    // Deep-link step 2: once the matching contact appears in the search results,
    // select it exactly like a manual click - this drives the same effect that
    // resolves activeConversationId, so left/center/right panels all populate
    // through the normal flow instead of a one-off standalone page.
    useEffect(() => {
        // Wait until step 1 has actually narrowed the search - otherwise the
        // "exactly one result" fallback below could match against the
        // default/unfiltered contact list before the identifier search runs.
        if (!pendingDeepLinkConversationId || !searchTerm) return;
        const match =
            filteredContacts.find(
                (c: OmnichannelContact) => c.latest_conversation_id === pendingDeepLinkConversationId
            ) || (filteredContacts.length === 1 ? filteredContacts[0] : undefined);
        if (match) {
            handleSelectContact(match);
            setPendingDeepLinkConversationId(null);
        }
    }, [filteredContacts, pendingDeepLinkConversationId, searchTerm]);

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
        const content = chatMode === "whatsapp" ? inputText : emailHtmlContent;

        if (!selectedFile && !content.trim() && content !== "<br>") return;

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

                const accountId = accounts?.find((a: any) => a.channel_type === chatMode)?.id;
                if (!accountId) {
                    notify.error(`No active ${chatMode} account found`);
                    return;
                }

                const payload: any = {
                    account_id: accountId,
                    name: selectedContact.display_name,
                    subject: emailSubject,
                    message: content,
                };

                if (selectedContact.contact_id) {
                    payload.contact_id = selectedContact.contact_id;
                } else {
                    payload.to = chatMode === "email" ? selectedContact.email! : (selectedContact.phone_number || selectedContact.email!);
                }

                const newConv = await createConversationMutation.mutateAsync(payload);
                conversationId = newConv.id;
                setActiveConversationId(conversationId);

                // Add clearing here for new conversation email as well
                if (chatMode === "email") {
                    setEmailHtmlContent("");
                    if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
                    setEmailSubject("");
                    setEmailCc("");
                    setEmailBcc("");
                    setIsEmailComposerOpen(false);
                }

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
                    else {
                        setEmailHtmlContent("");
                        if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
                        setEmailSubject("");
                        setEmailCc("");
                        setEmailBcc("");
                        setIsEmailComposerOpen(false);
                    }
                }
            }
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

    const handleRefreshEmail = async (fullSync: boolean) => {
        try {
            await refreshEmailMutation.mutateAsync(fullSync);
            notify.success(fullSync ? "Full sync triggered successfully" : "Email refresh triggered successfully");
        } catch (error) {
            notify.error(handleError(error, "Refresh Email"));
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
            <div className="flex relative h-[calc(100vh-64px)] overflow-hidden bg-white gap-3">
                {/* Column 1: Contacts sidebar */}
                <div className="w-80 border border-gray-200 shadow-lg rounded-2xl flex flex-col shrink-0 z-10 bg-white">
                    <div className="p-4 border-b border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <AppInput
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startIcon={<Search />}
                                className="flex-1"
                                isBgWhite
                            />
                            {/* <button
                                onClick={() => router.push("/omnichannel/settings")}
                                className="p-2.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0 cursor-pointer"
                                title="Omnichannel Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button> */}
                        </div>
                        {!isNewContactOpen && filteredContacts.length > 0 && (
                            <AppButton
                                fullWidth
                                onClick={() => setIsNewContactOpen(true)}
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
                                onClick={() => handleRefreshEmail(false)}
                                disabled={refreshEmailMutation.isPending}
                            >
                                {refreshEmailMutation.isPending ? "Refreshing..." : "Refresh"}
                            </AppButton>
                            <AppButton
                                variantStyle="outline"
                                color="gray"
                                size="small"
                                className="flex-1 text-[11px] h-8 px-2 border-gray-200 text-gray-500 hover:text-gray-700 font-semibold"
                                onClick={() => handleRefreshEmail(true)}
                                disabled={refreshEmailMutation.isPending}
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
                                {filteredContacts.map((contact: OmnichannelContact) => {
                                    return (
                                        <div
                                            key={contact.contact_id}
                                            onClick={() => handleSelectContact(contact)}
                                            className={cn(
                                                "p-4 cursor-pointer transition-all hover:bg-gray-200 group flex items-start gap-3 border-b border-gray-50",
                                                selectedContact?.contact_id === contact.contact_id ? "bg-blue-50/50" : ""
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
                                                {contact.display_name ? contact.display_name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "?"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 truncate text-sm">{contact.display_name}</h4>
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
                                                    {contact.unread_count > 0 && (
                                                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-sm">
                                                            {contact.unread_count > 99 ? '99+' : contact.unread_count}
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
                            <div className="min-h-[100px] py-4 px-4 sm:px-6 border-b border-gray-100 rounded-2xl bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 gap-4 lg:gap-0">
                                {/* Information */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full lg:w-auto">
                                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                                        <h3 className="font-bold text-gray-900 truncate flex items-center gap-2 text-base">
                                            {selectedContact.display_name}
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 border border-gray-200 flex items-center gap-1 uppercase tracking-wider">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                {conversation?.sentiment_label || "No Sentiment"}
                                            </span>
                                        </h3>
                                        <div className="flex flex-col items-start gap-1.5 mt-0.5">
                                            {(activeConversationId || isChannelSelected) && (
                                                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                                    {/* {selectedContact.channel_types.includes("whatsapp") && ( */}
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
                                                    {/* )} */}
                                                    {/* {selectedContact.channel_types.includes("email") && ( */}
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
                                                    {/* )} */}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 ml-2">
                                                <span className="text-xs text-gray-400">Identity: {selectedContact.primary_identifier}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    Channels: {selectedContact.channel_types.join(", ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Button Header */}
                                <div className="flex items-center justify-end w-full lg:w-auto gap-2 mt-2 lg:mt-0">
                                    <button
                                        onClick={handleDeleteConversation}
                                        className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-50 rounded-lg transition-all"
                                        title="Delete conversation"
                                        disabled={!activeConversationId || deleteConversationMutation.isPending}
                                    >
                                        {deleteConversationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="p-2 text-gray-400 border border-gray-200 hover:text-primary hover:bg-gray-50 rounded-lg transition-all lg:hidden xl:inline-flex"
                                        title={isSidebarOpen ? "Close details" : "Open details"}
                                    >
                                        {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="p-2 text-gray-400 border border-gray-200 hover:text-primary hover:bg-gray-50 rounded-lg transition-all hidden lg:inline-flex xl:hidden"
                                        title={isSidebarOpen ? "Close details" : "Open details"}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
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
                                    ) : !isEmailComposerOpen ? (
                                        <div className="flex justify-end p-2 pb-0">
                                            <AppButton onClick={() => setIsEmailComposerOpen(true)} startIcon={<Mail className="w-4 h-4" />}>
                                                Reply via Email
                                            </AppButton>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all focus-within:shadow-md">
                                            {/* Email Header Tabs */}
                                            {/* <div className="flex items-center justify-between px-4 py-2 bg-[#F8F9FA] border-b border-gray-100">
                                                <div className="flex items-center gap-1">
                                                    <button className="px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 transition-colors">New Email</button>
                                                    <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">Reply</button>
                                                    <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">Reply All</button>
                                                    <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">Forward</button>
                                                    <div className="ml-1 px-2 py-0.5 bg-[#E8EAFD] text-[#5C67F2] text-[10px] font-bold rounded border border-blue-100 uppercase tracking-tighter shadow-sm">New</div>
                                                </div>
                                                <div className="text-[10px] font-medium text-gray-400 font-mono">Ctrl+Enter to send</div>
                                            </div> */}

                                            {/* Recipient Rows */}
                                            <div className="divide-y divide-gray-50">
                                                <div className="flex items-center gap-3 px-4 py-2.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">TO</span>
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-700 placeholder:text-gray-300 font-medium"
                                                        defaultValue={selectedContact.email || ""}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 px-4 py-2.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">CC</span>
                                                    <input
                                                        type="text"
                                                        value={emailCc}
                                                        onChange={(e) => setEmailCc(e.target.value)}
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-600 placeholder:text-gray-300"
                                                        placeholder="cc@example.com (optional)"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 px-4 py-2.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">BCC</span>
                                                    <input
                                                        type="text"
                                                        value={emailBcc}
                                                        onChange={(e) => setEmailBcc(e.target.value)}
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-600 placeholder:text-gray-300"
                                                        placeholder="bcc@example.com (optional)"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 px-4 py-2.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">SUBJECT</span>
                                                    <input
                                                        type="text"
                                                        value={emailSubject}
                                                        onChange={(e) => setEmailSubject(e.target.value)}
                                                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 font-bold text-gray-900 placeholder:text-gray-300 uppercase tracking-tight"
                                                        placeholder="Subject"
                                                    />
                                                </div>
                                            </div>

                                            {/* Rich Text Toolbar */}
                                            <RichTextToolbar onAction={execCommand} />

                                            {/* Email Body */}
                                            <div className="p-0">
                                                <div
                                                    ref={emailEditorRef}
                                                    contentEditable
                                                    onInput={(e) => setEmailHtmlContent((e.target as HTMLDivElement).innerHTML)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.ctrlKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    data-placeholder="Write an email reply..."
                                                    className="w-full bg-white border-none focus:outline-none text-[13px] p-4 min-h-[220px] text-gray-700 leading-relaxed overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
                                                    style={{ border: 'none' }}
                                                />
                                            </div>

                                            {/* Send Button Trigger Footer */}
                                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                                <AppButton
                                                    type="button"
                                                    variantStyle="outline"
                                                    color="gray"
                                                    className="text-xs py-1.5"
                                                    onClick={() => setIsEmailComposerOpen(false)}
                                                >
                                                    Cancel
                                                </AppButton>
                                                <AppButton
                                                    type="button"
                                                    className="text-xs py-1.5"
                                                    onClick={handleSendMessage}
                                                    disabled={sendMessageMutation.isPending || createConversationMutation.isPending}
                                                    startIcon={sendMessageMutation.isPending || createConversationMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                >
                                                    Send Email
                                                </AppButton>
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

                {/* Backdrop for mobile/laptop when sidebar open */}
                {selectedContact && isSidebarOpen && (
                    <div
                        className="xl:hidden absolute inset-0 bg-gray-900/20 z-10 rounded-2xl"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Column 3: Contact Details sidebar */}
                {selectedContact && isSidebarOpen && (
                    <div className="absolute right-0 top-0 bottom-0 z-20 xl:relative xl:z-auto w-80 rounded-2xl border border-gray-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300 shadow-xl xl:shadow-none h-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wider">Contact Details</h3>
                            <button className="xl:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50" onClick={() => setIsSidebarOpen(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <DetailItem label="Name" value={selectedContact.display_name} icon={<UserPlus className="w-4 h-4" />} />
                            <DetailItem label="Email" value={selectedContact.email || "-"} icon={<Mail className="w-4 h-4" />} />
                            <DetailItem label="Phone" value={(selectedContact as any).phone || (selectedContact as any).phone_number || "-"} icon={<Phone className="w-4 h-4" />} />
                            <DetailItem label="Company" value={selectedContact.company || "-"} icon={<Building className="w-4 h-4" />} />
                            <DetailItem label="Position" value={(selectedContact as any).job_title || (selectedContact as any).position || "-"} icon={<Briefcase className="w-4 h-4" />} />
                            {/* <DetailItem label="Address" value={selectedContact.address || "-"} icon={<MapPin className="w-4 h-4" />} /> */}

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

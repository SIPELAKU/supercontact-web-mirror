"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useConversation,
    useSendMessage,
    useDeleteConversation,
    useAccounts,
    useCreateConversation,
    useMarkAsRead,
    useUploadMedia,
    useOmnichannelContacts,
    useRefreshEmail,
    useCreateTicketFromConversation
} from "@/lib/hooks/useOmnichannel";
import { useOmnichannelRealtime } from "@/lib/hooks/useOmnichannelRealtime";
import { useAgentTypingSignal } from "@/lib/hooks/useConversationTyping";
import { fetchContactTimeline } from "@/lib/api/omnichannel";
import { ContactReq } from "@/lib/models/types";
import { OmnichannelContact } from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "../ui/page-header";
import { ConfirmationPopup } from "../ui/confirmation-popup";
import ContactListSidebar from "./ContactListSidebar";
import ConversationPanel from "./ConversationPanel";
import ConversationDetailSidebar from "./ConversationDetailSidebar";

export default function OmnichannelClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const [selectedContact, setSelectedContact] = useState<OmnichannelContact | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isNewContactOpen, setIsNewContactOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState<"whatsapp" | "email" | "web_widget">("whatsapp");
    const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [emailSubject, setEmailSubject] = useState("");
    const [emailCc, setEmailCc] = useState("");
    const [emailBcc, setEmailBcc] = useState("");
    const [emailHtmlContent, setEmailHtmlContent] = useState("");
    const [inputText, setInputText] = useState("");
    const [isChannelSelected, setIsChannelSelected] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emailEditorRef = useRef<HTMLDivElement>(null);

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

    // Contacts data - left panel's channel category filter (All/WhatsApp/
    // Email) and last-activity time window (all/1d/1w/1m) are server-side,
    // so recency ordering stays correct per category. Web-widget conversations
    // live in the Support Desk Workspace, so this contact-first inbox only
    // covers WhatsApp + Email (status/priority/assignment filters belong to the
    // Workspace queue, not here).
    const [listChannelFilter, setListChannelFilter] = useState<"all" | "whatsapp" | "email">("all");
    const [listTimeFilter, setListTimeFilter] = useState<number>(0); // 0 = all time, else days
    const { data: omnichannelContactsData, isLoading: isLoadingContacts, refetch: refetchContacts } = useOmnichannelContacts(
        searchTerm,
        listChannelFilter === "all" ? undefined : listChannelFilter,
        listTimeFilter || undefined
    );
    const { data: accounts } = useAccounts();
    const createConversationMutation = useCreateConversation();
    // Which account a NEW conversation sends from, for multi-account companies.
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const channelAccounts = useMemo(
        () => (accounts || []).filter((a) => a.channel_type === chatMode),
        [accounts, chatMode]
    );

    // Selected conversation data
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const { data: conversation, isLoading: isLoadingConversation } = useConversation(activeConversationId || "");

    // Page-scoped realtime: patches the contacts list + invalidates the open
    // conversation on WS push, backstopped by the refetchInterval polling in
    // useOmnichannel.ts. See lib/hooks/useOmnichannelRealtime.ts.
    useOmnichannelRealtime(activeConversationId || undefined);

    // Best-effort agent-typing signal (throttled ~2s) for the WhatsApp/Web and
    // Email composers, wired through the client-owned input handlers below.
    const notifyAgentTyping = useAgentTypingSignal(activeConversationId);

    // Deep-link support: ?conversation=<id> (used by the notification panel).
    // We resolve the conversation's contact identifier, search for it, then
    // select it exactly like a normal manual click would (steps below).
    const conversationParam = searchParams.get("conversation");
    const [pendingDeepLinkConversationId, setPendingDeepLinkConversationId] = useState<string | null>(null);
    const { data: deepLinkConversation, isError: isDeepLinkConversationError } = useConversation(
        pendingDeepLinkConversationId || ""
    );

    // Re-arm whenever the URL's conversation param changes (page stays mounted).
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
    const createTicketMutation = useCreateTicketFromConversation();

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

    // Resolve the conversation for the selected contact + active chatMode tab.
    // Single-channel contacts carry latest_conversation_id directly; a
    // multi-channel contact (WhatsApp + Email) needs the merged timeline
    // endpoint to disambiguate, since latest_conversation_id isn't channel-specific.
    useEffect(() => {
        if (!selectedContact || !selectedContact.channel_types.includes(chatMode)) {
            setActiveConversationId(null);
            return;
        }

        if (selectedContact.channel_types.length <= 1) {
            setActiveConversationId(selectedContact.latest_conversation_id || null);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                const timeline = await fetchContactTimeline(token, selectedContact.inbox_key, chatMode);
                if (cancelled) return;
                const match = timeline.conversations.find((c) => c.channel_type === chatMode);
                setActiveConversationId(match?.conversation_id || null);
            } catch (error) {
                if (!cancelled) setActiveConversationId(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedContact, chatMode, getToken]);

    // Reset the account picker on channel/contact switch - auto-pick when
    // exactly one account matches so single-account companies see no extra click.
    useEffect(() => {
        setSelectedAccountId(channelAccounts.length === 1 ? channelAccounts[0].id : "");
    }, [chatMode, selectedContact, channelAccounts]);

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

    // Mobile back button (ConversationHeader): return to column 1.
    const handleBack = () => {
        setSelectedContact(null);
        setActiveConversationId(null);
    };

    // Deep-link step 1: once the target conversation loads, search by its
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

    // Deep-link step 2: once the matching contact appears in results, select it
    // like a manual click - drives the resolution effect above for all 3 columns.
    useEffect(() => {
        // Wait for step 1 to narrow the search first, or "exactly one result"
        // below could match the default/unfiltered list too early.
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
        const content = chatMode === "email" ? emailHtmlContent : inputText;

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

                const accountId = selectedAccountId || channelAccounts[0]?.id;
                if (!accountId) {
                    notify.error(`No active ${chatMode} account found`);
                    return;
                }
                if (channelAccounts.length > 1 && !selectedAccountId) {
                    notify.error(`Choose which ${chatMode} account to send from`);
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
                    if (chatMode === "email") {
                        setEmailHtmlContent("");
                        if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
                        setEmailSubject("");
                        setEmailCc("");
                        setEmailBcc("");
                        setIsEmailComposerOpen(false);
                    } else {
                        setInputText("");
                    }
                }
            }
        } catch (error) {
            notify.error(handleError(error, "Send Message"));
        }
    };

    const handleDeleteConversation = async () => {
        if (!activeConversationId) return;

        try {
            await deleteConversationMutation.mutateAsync(activeConversationId);
            setActiveConversationId(null);
            setDeleteConfirmOpen(false);
            notify.success("Conversation deleted");
        } catch (error) {
            notify.error(handleError(error, "Delete Conversation"));
        }
    };

    const handleCreateTicket = async () => {
        if (!activeConversationId) return;
        try {
            const res = await createTicketMutation.mutateAsync(activeConversationId);
            const ticketId = res?.data?.id;
            notify.success("Ticket Created", { description: "A new ticket was created from this conversation." });
            if (ticketId) router.push(`/support/tickets/${ticketId}`);
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Create Ticket") });
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
                <ContactListSidebar
                    contacts={filteredContacts}
                    isLoading={isLoadingContacts}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    channelFilter={listChannelFilter}
                    onChannelFilterChange={setListChannelFilter}
                    timeFilter={listTimeFilter}
                    onTimeFilterChange={setListTimeFilter}
                    selectedContactId={selectedContact?.contact_id}
                    onSelectContact={handleSelectContact}
                    onRefresh={() => handleRefreshEmail(false)}
                    onFullSync={() => handleRefreshEmail(true)}
                    isRefreshPending={refreshEmailMutation.isPending}
                    isNewContactOpen={isNewContactOpen}
                    onToggleNewContact={setIsNewContactOpen}
                    newContact={newContact}
                    onNewContactChange={setNewContact}
                    onCreateContact={handleCreateContact}
                    isSubmittingContact={isSubmittingContact}
                />

                {/* Column 2: Chat Area */}
                <ConversationPanel
                    selectedContact={selectedContact}
                    conversation={conversation}
                    isLoadingConversation={isLoadingConversation}
                    activeConversationId={activeConversationId}
                    isChannelSelected={isChannelSelected}
                    onStartChannel={(mode) => { setChatMode(mode); setIsChannelSelected(true); }}
                    chatMode={chatMode}
                    onChatModeChange={setChatMode}
                    channelAccounts={channelAccounts}
                    selectedAccountId={selectedAccountId}
                    onAccountChange={setSelectedAccountId}
                    onCreateTicket={handleCreateTicket}
                    isCreateTicketPending={createTicketMutation.isPending}
                    onDeleteConversation={() => setDeleteConfirmOpen(true)}
                    isDeleteConversationPending={deleteConversationMutation.isPending}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onBack={handleBack}
                    onSendMessage={handleSendMessage}
                    whatsapp={{
                        inputText,
                        onInputChange: (value) => {
                            setInputText(value);
                            notifyAgentTyping();
                        },
                        selectedFile,
                        previewUrl,
                        onFileTrigger: handleFileTrigger,
                        onFileChange: handleFileChange,
                        onRemoveFile: handleRemoveFile,
                        fileInputRef,
                        isSending: sendMessageMutation.isPending || createConversationMutation.isPending || uploadMediaMutation.isPending,
                        // AI Copilot: full drawer once a conversation exists (else
                        // Rewrite-only). Insert writes into the same inputText draft
                        // state the composer sends from - never auto-sends.
                        copilot: {
                            conversationId: activeConversationId,
                            getDraft: () => inputText,
                            onInsert: (text, mode) =>
                                setInputText((prev) =>
                                    mode === "replace" ? text : prev ? `${prev}\n${text}` : text
                                ),
                        },
                    }}
                    email={{
                        isOpen: isEmailComposerOpen,
                        onOpen: () => setIsEmailComposerOpen(true),
                        onCancel: () => setIsEmailComposerOpen(false),
                        cc: emailCc,
                        onCcChange: setEmailCc,
                        bcc: emailBcc,
                        onBccChange: setEmailBcc,
                        subject: emailSubject,
                        onSubjectChange: setEmailSubject,
                        editorRef: emailEditorRef,
                        onBodyInput: (e) => {
                            setEmailHtmlContent((e.target as HTMLDivElement).innerHTML);
                            notifyAgentTyping();
                        },
                        onBodyKeyDown: (e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        },
                        onToolbarAction: execCommand,
                        isSending: sendMessageMutation.isPending || createConversationMutation.isPending,
                        // AI Copilot: reads/writes the contentEditable body text
                        // and keeps emailHtmlContent in sync. Never auto-sends.
                        copilot: {
                            conversationId: activeConversationId,
                            getDraft: () => emailEditorRef.current?.innerText ?? "",
                            onInsert: (text, mode) => {
                                const el = emailEditorRef.current;
                                if (!el) return;
                                if (mode === "replace") el.innerText = text;
                                else el.innerText = el.innerText ? `${el.innerText}\n${text}` : text;
                                setEmailHtmlContent(el.innerHTML);
                            },
                        },
                    }}
                />

                {/* Column 3: Contact Details sidebar */}
                <ConversationDetailSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    selectedContact={selectedContact}
                    onViewProfile={() => selectedContact && router.push(`/contact/detail/${selectedContact.contact_id}?tab=conversations`)}
                    conversationId={activeConversationId}
                />
            </div>

            {/* Delete Conversation Confirmation */}
            <ConfirmationPopup
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConversation}
                title="Delete Conversation"
                description="Are you sure you want to delete this conversation? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}

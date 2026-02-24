"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchInbox,
    fetchMessages,
    fetchUsers,
    sendMessage,
    sendAttachment,
    pinMessage,
    unpinMessage,
    deleteMessagesMultiple,
    deleteConversation,
    markAsRead,
    ChatUser,
    ChatMessage,
    NewChatUser
} from "@/lib/api/chat";

export type UIMessage = ChatMessage & { isPending?: boolean; localPreviewUrl?: string };

export const PIN_DURATIONS = ["24h", "7d", "30d"] as const;

export function useChat() {
    const { getToken } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    // Data States
    const [inboxList, setInboxList] = useState<ChatUser[]>([]);
    const [userList, setUserList] = useState<NewChatUser[]>([]);
    const [activeChatMessages, setActiveChatMessages] = useState<UIMessage[]>([]);
    const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

    // UI States
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const activeChatIdRef = useRef<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [viewMode, setViewMode] = useState<"inbox" | "contacts">("inbox");
    const [loadingInbox, setLoadingInbox] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Interaction Types
    const [showChatOptions, setShowChatOptions] = useState(false);
    const [showBubbleOptions, setShowBubbleOptions] = useState<{ id: string, x: number, y: number } | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

    // Modals & Overlays
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; id: string; sender: string; time: string; avatar: string | null; initial: string } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMessageId, setPinMessageId] = useState<string | null>(null);
    const [pinDuration, setPinDuration] = useState<typeof PIN_DURATIONS[number] | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<'conversation' | 'messages' | null>(null);
    const [messagesToDelete, setMessagesToDelete] = useState<string[]>([]);

    // Audio Recording Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Sync ref
    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    // -- 1. Initialization & Auth --
    useEffect(() => {
        getToken().then(t => setToken(t)).catch(console.error);
    }, [getToken]);

    const loadInbox = useCallback(async () => {
        if (!token) return;
        setLoadingInbox(true);
        try {
            const res = await fetchInbox(token);
            setInboxList(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingInbox(false);
        }
    }, [token]);

    // -- 2. Fetch Inbox --
    useEffect(() => {
        loadInbox();
    }, [loadInbox]);

    // -- 3. Fetch Contact List (New Chat) --
    useEffect(() => {
        if (viewMode === "contacts" && token) {
            fetchUsers(token).then(res => setUserList(res.data)).catch(console.error);
        }
    }, [viewMode, token]);

    // -- 4. Fetch Messages for Active Chat --
    useEffect(() => {
        if (!activeChatId || !token) return;

        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await fetchMessages(token, activeChatId);
                const sorted = res.data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setActiveChatMessages(sorted);

                await markAsRead(token, activeChatId);
                setInboxList(prev => prev.map(c => c.user_id === activeChatId ? { ...c, unread_count: 0 } : c));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [activeChatId, token]);

    // -- 5. Sync Active Chat User Info --
    useEffect(() => {
        if (!activeChatId) return;
        const userFromInbox = inboxList.find(u => u.user_id === activeChatId);
        if (userFromInbox) setActiveChatUser(userFromInbox);
    }, [activeChatId, inboxList]);

    // -- WebSocket Connection --
    useEffect(() => {
        if (!token) return;

        const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

        let userId = "";
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            userId = payload.sub || payload.id || payload.user_id;
        } catch (e) {
            console.error("[WS Debug] Failed to parse token for WS", e);
            return;
        }

        if (!userId) return;

        const wsUrl = `${wsBaseUrl}/chat/ws/chat/${userId}?token=${token}`;
        if (wsRef.current) wsRef.current.close();
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            if (activeChatIdRef.current) {
                wsRef.current?.send(JSON.stringify({ type: "viewing", partner_id: activeChatIdRef.current }));
            }
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.id && (data.message || data.media_url)) {
                    const newMsg: ChatMessage = data;
                    const currentActiveId = activeChatIdRef.current;

                    if ((newMsg.sender_id === currentActiveId) || (newMsg.receiver_id === currentActiveId)) {
                        setActiveChatMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        if (newMsg.sender_id === currentActiveId) {
                            markAsRead(token, currentActiveId).catch(err => console.error("[WS Debug] Mark read failed", err));
                        }
                    }

                    setInboxList(prev => {
                        const existingIdx = prev.findIndex(c => c.user_id === newMsg.sender_id || c.user_id === newMsg.receiver_id);
                        if (existingIdx !== -1) {
                            const updated = [...prev];
                            const conv = updated[existingIdx];
                            updated[existingIdx] = {
                                ...conv,
                                last_message_preview: newMsg.message || (newMsg.media_url ? "Sent a file" : ""),
                                last_message_time: newMsg.created_at,
                                unread_count: (newMsg.sender_id !== userId && newMsg.sender_id !== currentActiveId) ? conv.unread_count + 1 : conv.unread_count
                            };
                            const [moved] = updated.splice(existingIdx, 1);
                            updated.unshift(moved);
                            return updated;
                        }
                        if (newMsg.sender_id !== userId && existingIdx === -1) loadInbox();
                        return prev;
                    });
                }
            } catch (e) {
                console.error("[WS Debug] WS Parse error", e);
            }
        };

        return () => wsRef.current?.close();
    }, [token, loadInbox]);

    useEffect(() => {
        if (activeChatId && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "viewing", partner_id: activeChatId }));
        }
    }, [activeChatId]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatId || !token) return;
        const txt = messageInput;
        setMessageInput("");

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ receiver_id: activeChatId, message: txt, type: "Text" }));
                return;
            } catch (e) {
                console.error("[WS Debug] WS Send failed", e);
            }
        }

        try {
            const response = await sendMessage(token, { receiver_id: activeChatId, message: txt, type: "Text" });
            const newMsg = response.data;
            setActiveChatMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
            setInboxList(prev => {
                const idx = prev.findIndex(c => c.user_id === activeChatId);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], last_message_preview: txt, last_message_time: newMsg.created_at || new Date().toISOString(), unread_count: 0 };
                    const [moved] = updated.splice(idx, 1);
                    updated.unshift(moved);
                    return updated;
                } else if (activeChatUser) {
                    return [{ ...activeChatUser, last_message_preview: txt, last_message_time: newMsg.created_at || new Date().toISOString(), unread_count: 0 }, ...prev];
                }
                return prev;
            });
        } catch (err) {
            console.error("Send failed", err);
            setMessageInput(txt);
        }
    };

    const executeDelete = async () => {
        if (!token) return;
        try {
            if (deleteType === "conversation") {
                if (!activeChatId) return;
                await deleteConversation(token, activeChatId);
                setActiveChatMessages([]);
                loadInbox();
            } else if (deleteType === "messages") {
                if (messagesToDelete.length === 0) return;
                await deleteMessagesMultiple(token, messagesToDelete);
                setActiveChatMessages(prev => prev.filter(m => !messagesToDelete.includes(m.id)));
                if (selectionMode) {
                    setSelectedMessages([]);
                    setSelectionMode(false);
                }
            }
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setShowDeleteModal(false);
            setMessagesToDelete([]);
            setDeleteType(null);
        }
    };

    const handleUploadFiles = async (files: File[]) => {
        if (files.length === 0 || !activeChatId || !token) return;
        try {
            const optimisticMessages: UIMessage[] = files.map(file => ({
                id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender_id: '',
                receiver_id: activeChatId,
                message: "",
                type: file.type.startsWith('image/') ? "Image" : (file.type.startsWith('audio/') ? "Voice" : "File"),
                media_url: null,
                media_file_id: null,
                is_read: false,
                pinned_expires_at: null,
                created_at: new Date().toISOString(),
                isPending: true,
                localPreviewUrl: URL.createObjectURL(file)
            }));

            setActiveChatMessages(prev => [...prev, ...optimisticMessages]);
            const newMsgs = await sendAttachment(token, activeChatId, files);
            setActiveChatMessages(prev => {
                const withoutOptimistic = prev.filter(p => !optimisticMessages.find(opt => opt.id === p.id));
                const uniqueNewMsgs = newMsgs.data.filter(newMsg => !withoutOptimistic.some(p => p.id === newMsg.id));
                return [...withoutOptimistic, ...uniqueNewMsgs];
            });
            optimisticMessages.forEach(msg => msg.localPreviewUrl && URL.revokeObjectURL(msg.localPreviewUrl));
        } catch (err) {
            console.error("Upload failed", err);
            setActiveChatMessages(prev => prev.filter(m => !m.isPending));
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;
        setIsUploadModalOpen(false);
        await handleUploadFiles(Array.from(files));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
            recorder.onstop = async () => {
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' });
                    handleUploadFiles([audioFile]);
                }
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            recordingTimerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
        } catch (err) {
            console.error("Failed to start recording", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
            if (mediaRecorderRef.current.stream) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            audioChunksRef.current = [];
        }
    };

    const handleSelectContact = (user: NewChatUser) => {
        const existing = inboxList.find(c => c.user_id === user.id);
        if (!existing) {
            setActiveChatUser({
                user_id: user.id, user_fullname: user.fullname, user_avatar: user.avatar, user_avatar_initial: user.avatar_initial,
                user_position: user.position, last_message_preview: "Start a conversation", last_message_time: new Date().toISOString(),
                unread_count: 0, email: user.email, phone: user.phone, about: user.about,
            });
        }
        setActiveChatId(user.id);
        setViewMode("inbox");
    };

    const confirmPin = async () => {
        if (!pinMessageId || !pinDuration || !token) return;
        try {
            await pinMessage(token, pinMessageId, pinDuration);
            setActiveChatMessages(prev => prev.map(m => m.id === pinMessageId ? { ...m, pinned_expires_at: new Date(Date.now() + 10000000).toISOString() } : m));
        } catch (err) { console.error(err); }
        setShowPinModal(false);
        setPinMessageId(null);
    };

    const unpin = async (msgId: string) => {
        if (!token) return;
        try {
            await unpinMessage(token, msgId);
            setActiveChatMessages(p => p.map(m => m.id === msgId ? { ...m, pinned_expires_at: null } : m));
        } catch (err) { console.error(err); }
    };

    // -- Auto-Scroll --
    useEffect(() => {
        // Only scroll if we have messages and we're not loading (so they are rendered)
        if (!loadingMessages && activeChatMessages.length > 0) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeChatMessages, activeChatId, loadingMessages]);

    return {
        token,
        inboxList, setInboxList,
        userList,
        activeChatMessages, setActiveChatMessages,
        activeChatUser, setActiveChatUser,
        activeChatId, setActiveChatId,
        searchTerm, setSearchTerm,
        messageInput, setMessageInput,
        viewMode, setViewMode,
        loadingInbox, loadingMessages, isSending,
        showChatOptions, setShowChatOptions,
        showBubbleOptions, setShowBubbleOptions,
        selectionMode, setSelectionMode,
        selectedMessages, setSelectedMessages,
        isUploadModalOpen, setIsUploadModalOpen,
        previewImage, setPreviewImage,
        zoomLevel, setZoomLevel,
        showContactInfo, setShowContactInfo,
        showPinModal, setShowPinModal,
        pinMessageId, setPinMessageId,
        pinDuration, setPinDuration,
        showDeleteModal, setShowDeleteModal,
        deleteType, setDeleteType,
        messagesToDelete, setMessagesToDelete,
        isRecording, recordingDuration,
        messagesEndRef,
        handleSendMessage,
        executeDelete,
        handleFileUpload,
        handleUploadFiles,
        startRecording,
        stopRecording,
        cancelRecording,
        handleSelectContact,
        confirmPin,
        unpin,
        loadInbox
    };
}

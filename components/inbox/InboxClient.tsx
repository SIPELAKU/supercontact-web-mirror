"use client";

import PageHeader from "@/components/ui/page-header";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Mail,
  Loader2,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Search,
  Send,
  Trash2,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
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
import VoiceMessageBubble from "./VoiceMessageBubble";

// Helper for pinning modal options
const PIN_DURATIONS = ["24h", "7d", "30d"] as const;

export default function InboxClient() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  // Data States
  // Extended type for UI-only states
  type UIMessage = ChatMessage & { isPending?: boolean; localPreviewUrl?: string };

  const [inboxList, setInboxList] = useState<ChatUser[]>([]);
  const [userList, setUserList] = useState<NewChatUser[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<UIMessage[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  // UI States
  const [activeChatId, setActiveChatId] = useState<string | null>(null); // target_id (user_id)
  const activeChatIdRef = useRef<string | null>(null); // Ref for WS access without reconnection

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
  const chatOptionsRef = useRef<HTMLDivElement>(null);
  const bubbleOptionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Find active user info from inbox list or set provisional
    console.log('inboxList', inboxList)
    const userFromInbox = inboxList.find(u => u.user_id === activeChatId);
    if (userFromInbox) setActiveChatUser(userFromInbox);
    // If starting new chat, activeChatUser might need to be set from userList in handleSelectContact

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetchMessages(token, activeChatId);
        // Sort by created_at just in case
        const sorted = res.data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setActiveChatMessages(sorted);

        // Mark as read
        await markAsRead(token, activeChatId);
        // Update local unread count
        setInboxList(prev => prev.map(c => c.user_id === activeChatId ? { ...c, unread_count: 0 } : c));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();

  }, [activeChatId, token]);

  // -- WebSocket Connection --
  useEffect(() => {
    if (!token) return;

    // Use default URL if env not set
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

    // Parse Token to get User ID
    let userId = "";
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      userId = payload.sub || payload.id || payload.user_id; // Try common claims
      console.log("[WS Debug] Derived UserId from token:", userId);
    } catch (e) {
      console.error("[WS Debug] Failed to parse token for WS", e);
      return;
    }

    if (!userId) {
      console.error("[WS Debug] No user ID found in token for WS");
      return;
    }

    // Reverting to documented path which was confirmed to connect in Step 41
    const wsUrl = `${wsBaseUrl}/chat/ws/chat/${userId}?token=${token}`;
    console.log("[WS Debug] Connecting to WS...", wsUrl);

    // Close existing connection if any
    if (wsRef.current) {
      console.log("[WS Debug] Closing existing connection before new one");
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[WS Debug] WS Connected (OPEN)');
      // Initial presence if chat is open
      if (activeChatIdRef.current) {
        const payload = { type: "viewing", partner_id: activeChatIdRef.current };
        console.log("[WS Debug] Sending initial presence:", payload);
        wsRef.current?.send(JSON.stringify(payload));
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('[WS Debug] WS Error:', error);
    };

    wsRef.current.onclose = (event) => {
      console.log(`[WS Debug] WS Closed: Code=${event.code}, Reason=${event.reason}, WasClean=${event.wasClean}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        console.log("[WS Debug] RAW FRAME RECEIVED:", event.data);
        const data = JSON.parse(event.data);

        // Handle new message
        if (data.id && (data.message || data.media_url)) { // Message or Media
          const newMsg: ChatMessage = data;
          const currentActiveId = activeChatIdRef.current; // Use Ref

          console.log("[WS Debug] Decoded Message:", {
            msgId: newMsg.id,
            senderId: newMsg.sender_id,
            receiverId: newMsg.receiver_id,
            type: newMsg.type,
            activeChatId: currentActiveId,
            matches: (newMsg.sender_id === currentActiveId) || (newMsg.receiver_id === currentActiveId)
          });

          // If active chat matches either sender or receiver
          if ((newMsg.sender_id === currentActiveId) || (newMsg.receiver_id === currentActiveId)) {
            console.log("[WS Debug] MATCH! Updating Active Store.");
            setActiveChatMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) {
                console.log("[WS Debug] Message duplicate ignored.");
                return prev;
              }
              const updated = [...prev, newMsg];
              return updated;
            });
            // Mark read if we are looking at it
            if (newMsg.sender_id === currentActiveId) {
              markAsRead(token, currentActiveId).catch(err => console.error("[WS Debug] Mark read failed", err));
            }
          } else {
            console.log("[WS Debug] NO MATCH. Updating Inbox List only.");
          }

          // Update Inbox Preview
          setInboxList(prev => {
            // Check existing conversation
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
              // Move to top
              const [moved] = updated.splice(existingIdx, 1);
              updated.unshift(moved);
              return updated;
            }
            // If new conversation from someone else (not in list)
            if (newMsg.sender_id !== userId && existingIdx === -1) {
              console.log("[WS Debug] New conversation via WS. Reloading Inbox.");
              loadInbox();
            }
            return prev;
          });
        } else {
          console.log("[WS Debug] Unknown/System message:", data);
        }
      } catch (e) {
        console.error("[WS Debug] WS Parse error. Data:", event.data, e);
      }
    };

    return () => {
      console.log("[WS Debug] Cleanup WS");
      wsRef.current?.close();
    };
  }, [token, loadInbox]);

  // -- NEW: Watch activeChatId to send presence --
  useEffect(() => {
    if (activeChatId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const payload = { type: "viewing", partner_id: activeChatId };
        console.log("[WS Debug] Sending presence update:", payload);
        wsRef.current.send(JSON.stringify(payload));
      } catch (e) {
        console.error("[WS Debug] Failed to send presence", e);
      }
    }
  }, [activeChatId]);


  // -- Auto-Scroll --
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatMessages]);

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOptionsRef.current && !chatOptionsRef.current.contains(event.target as Node)) {
        setShowChatOptions(false);
      }
      if (bubbleOptionsRef.current && !bubbleOptionsRef.current.contains(event.target as Node)) {
        setShowBubbleOptions(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // -- Action Handlers --

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatId || !token) return;
    const tempId = Date.now().toString();
    const txt = messageInput;
    setMessageInput(""); // Optimistic clear

    // Try WS Send first if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("[WS Debug] Sending message via WebSocket");
      try {
        wsRef.current.send(JSON.stringify({
          receiver_id: activeChatId,
          message: txt,
          type: "Text"
        }));
        return;
      } catch (e) {
        console.error("[WS Debug] WS Send failed, falling back to HTTP", e);
      }
    }

    try {
      const response = await sendMessage(token, {
        receiver_id: activeChatId,
        message: txt,
        type: "Text"
      });
      const newMsg = response.data;

      setActiveChatMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Update inbox preview
      setInboxList(prev => {
        const idx = prev.findIndex(c => c.user_id === activeChatId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message_preview: txt,
            last_message_time: newMsg.created_at || new Date().toISOString(),
            unread_count: 0
          };
          // Move to top
          const [moved] = updated.splice(idx, 1);
          updated.unshift(moved);
          return updated;
        } else {
          // New conversation - Add to list
          if (activeChatUser) {
            const newChat: ChatUser = {
              user_id: activeChatUser.user_id,
              user_fullname: activeChatUser.user_fullname,
              user_avatar: activeChatUser.user_avatar,
              user_avatar_initial: activeChatUser.user_avatar_initial,
              user_position: activeChatUser.user_position,
              last_message_preview: txt,
              last_message_time: newMsg.created_at || new Date().toISOString(),
              unread_count: 0,
              email: activeChatUser.email,
              phone: activeChatUser.phone,
              about: activeChatUser.about,
            };
            return [newChat, ...prev];
          }
        }
        return prev;
      });
    } catch (err) {
      console.error("Send failed", err);
      // TODO: show error toast, restore text
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

        // If we were in selection mode and deleted selections, clear it
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
      // 1. Create Optimistic Messages
      const optimisticMessages: UIMessage[] = files.map(file => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');

        return {
          id: tempId,
          sender_id: '', // Will be handled by "sentByMe" logic (sender_id !== activeChatId)
          receiver_id: activeChatId,
          message: "",
          type: isImage ? "Image" : (isAudio ? "Voice" : "File"),
          media_url: null,
          media_file_id: null,
          is_read: false,
          pinned_expires_at: null,
          created_at: new Date().toISOString(),
          isPending: true,
          localPreviewUrl: URL.createObjectURL(file)
        };
      });

      // 2. Add to State
      setActiveChatMessages(prev => [...prev, ...optimisticMessages]);

      // 3. Perform Upload
      const newMsgs = await sendAttachment(token, activeChatId, files);

      // 4. Replace Optimistic with Real
      setActiveChatMessages(prev => {
        // Remove optimistic messages
        const withoutOptimistic = prev.filter(p => !optimisticMessages.find(opt => opt.id === p.id));

        // Add new real messages (checking duplicates again just in case)
        const uniqueNewMsgs = newMsgs.data.filter(newMsg => !withoutOptimistic.some(p => p.id === newMsg.id));

        return [...withoutOptimistic, ...uniqueNewMsgs];
      });

      // Cleanup object URLs to avoid memory leaks
      optimisticMessages.forEach(msg => {
        if (msg.localPreviewUrl) URL.revokeObjectURL(msg.localPreviewUrl);
      });

    } catch (err) {
      console.error("Upload failed", err);
      // Remove optimistic messages on error
      // In a real app, might want to show "Retry" state
      setActiveChatMessages(prev => prev.filter(m => !m.isPending));
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    setIsUploadModalOpen(false);
    await handleUploadFiles(Array.from(files));
  };

  // -- Audio Recording Handlers --

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' });
          handleUploadFiles([audioFile]);
        }
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording", err);
      alert("Could not access microphone. Please ensure you have granted permission.");
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
      // Remove stop listener so it doesn't send
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      // Stop tracks manually since we removed the listener
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }

      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      audioChunksRef.current = [];
    }
  };

  const formatDuration = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, '0')}`;
  };


  const handleStartConversation = () => {
    setViewMode("contacts");
    setActiveChatId(null);
  }

  const handleSelectContact = (user: NewChatUser) => {
    // Check if chat exists in inbox
    const existing = inboxList.find(c => c.user_id === user.id);
    if (!existing) {
      // Add optimistic temporary inbox item or just set active user
      setActiveChatUser({
        user_id: user.id,
        user_fullname: user.fullname,
        user_avatar: user.avatar,
        user_avatar_initial: user.avatar_initial,
        user_position: user.position,
        last_message_preview: "Start a conversation",
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        email: user.email,
        phone: user.phone,
        about: user.about,
      });
    }
    setActiveChatId(user.id);
    setViewMode("inbox");
  }

  // Interaction Handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setShowChatOptions(false);
    setSelectedMessages([]);
  };

  const handleMessageClick = (msg: ChatMessage, e: React.MouseEvent) => {
    if (selectionMode) {
      if (selectedMessages.includes(msg.id)) {
        setSelectedMessages(prev => prev.filter(id => id !== msg.id));
      } else {
        setSelectedMessages(prev => [...prev, msg.id]);
      }
    } else {
      e.stopPropagation();
      setShowBubbleOptions({ id: msg.id, x: e.clientX, y: e.clientY });
    }
  };

  const handlePinClick = (msgId: string) => {
    setPinMessageId(msgId);
    setShowPinModal(true);
    setShowBubbleOptions(null);
  };

  const confirmPin = async () => {
    if (!pinMessageId || !pinDuration || !token) return;
    try {
      await pinMessage(token, pinMessageId, pinDuration);
      // Refresh local state or optimistic update
      setActiveChatMessages(prev => prev.map(m =>
        m.id === pinMessageId
          ? { ...m, pinned_expires_at: new Date(Date.now() + 10000000).toISOString() } // Dummy future date
          : m
      ));
    } catch (err) { console.error(err); }
    setShowPinModal(false);
    setPinMessageId(null);
  };

  const handleDeleteSelected = (msgId?: string) => {
    if (msgId) {
      setMessagesToDelete([msgId]);
    } else {
      if (selectedMessages.length === 0) return;
      setMessagesToDelete(selectedMessages);
    }
    setDeleteType("messages");
    setShowDeleteModal(true);
    setShowBubbleOptions(null);
  };


  // -- Render Helpers --

  // Group contacts for the contact list
  const groupedContacts = userList.reduce((acc, user) => {
    const letter = user.fullname.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(user);
    return acc;
  }, {} as Record<string, NewChatUser[]>);

  const pinnedMsg = activeChatMessages.find(
    (m) => m.pinned_expires_at && new Date(m.pinned_expires_at) > new Date()
  );

  // Preview Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));

  const handleDownloadImage = async () => {
    if (!previewImage) return;
    try {
      const response = await fetch(previewImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${Date.now()}.jpg`; // Simple fallback name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const handlePinFromPreview = () => {
    if (previewImage) {
      handlePinClick(previewImage.id);
      // Optional: Close preview functionality? Or keep it open.
      // setPreviewImage(null);
    }
  };

  useEffect(() => {
    if (previewImage) setZoomLevel(1);
  }, [previewImage]);

  return (
    <div className="w-full h-[calc(100vh)] flex flex-col gap-5 p-4 md:p-6 overflow-hidden bg-transparent">
      {viewMode === "inbox" ? (
        <>
          {/* Header Section */}
          <PageHeader
            title="My Inbox"
            breadcrumbs={[{ label: "Dashboard" }, { label: "My Inbox" }]}
          />

          {/* Main Content Card - Split View */}
          <div className="bg-white rounded-[16px] shadow-sm border border-gray-200/60 flex flex-1 overflow-hidden relative">
            {/* Left Sidebar - Chat List */}
            <div
              className={`w-full md:w-[320px] lg:w-[350px] flex flex-col border-r border-gray-100 ${activeChatId ? "hidden md:flex" : "flex"
                }`}
            >
              <div className="p-5 border-b border-gray-100/80 space-y-5">
                <div className="flex items-center gap-3">
                  {/* Self Avatar Placeholder - Ideally fetch profile */}
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-[#5479EE] font-bold">
                    ME
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-indigo-300 transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <h2 className="text-[#5479EE] font-semibold px-1">Chats</h2>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {loadingInbox ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                ) : (
                  inboxList
                    .filter((chat) =>
                      chat.user_fullname
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((chat) => (
                      <div
                        key={chat.user_id}
                        onClick={() => setActiveChatId(chat.user_id)}
                        className={`flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${activeChatId === chat.user_id
                          ? "bg-indigo-50 border-indigo-100/50"
                          : "hover:bg-gray-50 hover:border-gray-100"
                          }`}
                      >
                        <div className="relative mr-4 shrink-0">
                          {chat.user_avatar ? (
                            <img
                              src={chat.user_avatar}
                              className="w-11 h-11 rounded-full object-cover shadow-sm"
                              alt={chat.user_fullname}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-indigo-100 text-[#5479EE] flex items-center justify-center text-sm font-bold shadow-sm">
                              {chat.user_avatar_initial}
                            </div>
                          )}
                          {/* Status indicator not in API, add if available later */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3
                              className={`text-sm font-semibold truncate ${activeChatId === chat.user_id
                                ? "text-indigo-900"
                                : "text-gray-900"
                                }`}
                            >
                              {chat.user_fullname}
                            </h3>
                            <span
                              className={`text-[11px] font-medium ${activeChatId === chat.user_id
                                ? "text-indigo-400"
                                : "text-gray-400"
                                }`}
                            >
                              {new Date(chat.last_message_time).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <p
                              className={`text-xs truncate ${activeChatId === chat.user_id
                                ? "text-indigo-500 font-medium"
                                : "text-gray-500"
                                } max-w-[180px]`}
                            >
                              {chat.last_message_preview}
                            </p>
                            {chat.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {chat.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleStartConversation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Start Conversation
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div
              className={`flex-1 flex flex-col bg-[#EEF2F6] ${activeChatId ? "flex" : "hidden md:flex"
                } relative`}
            >
              {!activeChatId || !activeChatUser ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-[#F4F7FE]">
                  <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <div className="relative">
                      <MessageCircle className="w-16 h-16 text-indigo-500 fill-indigo-500/20" />
                      <MessageCircle className="w-10 h-10 text-indigo-400 fill-indigo-400/20 absolute -top-2 -right-6 transform rotate-12" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#5479EE] mb-2">
                    My Inbox
                  </h2>
                  <p className="text-gray-500 font-medium">
                    Select a conversation or start a new one.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="bg-white/80 backdrop-blur-md p-4 px-6 border-b border-gray-200/60 sticky top-0 z-10 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveChatId(null)}
                          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="relative">
                          {activeChatUser.user_avatar ? (
                            <img
                              src={activeChatUser.user_avatar}
                              className="w-10 h-10 rounded-full object-cover"
                              alt="avatar"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#5479EE] flex items-center justify-center text-sm font-bold shadow-sm">
                              {activeChatUser.user_avatar_initial}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {activeChatUser.user_fullname}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {/* Online status not in API currently, generic placeholder */}
                            <p className="text-xs text-gray-500 capitalize">
                              {activeChatUser.user_position}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 relative">
                        <button
                          onClick={() => setShowChatOptions(!showChatOptions)}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showChatOptions && (
                          <div
                            ref={chatOptionsRef}
                            className="absolute top-10 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={() => {
                                setShowContactInfo(true);
                                setShowChatOptions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                            >
                              Contact Info
                            </button>
                            <button
                              onClick={toggleSelectionMode}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                            >
                              Select Messages
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType("conversation");
                                setShowDeleteModal(true);
                                setShowChatOptions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              Clear Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pinned Message Banner */}
                  {pinnedMsg && (
                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <Pin className="w-4 h-4 text-[#5479EE] shrink-0 fill-indigo-600" />
                      <div className="flex-1 min-w-0">
                        {/* We only have message text, check type */}
                        {pinnedMsg.type === "Image" ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={pinnedMsg.media_url || pinnedMsg.localPreviewUrl || ""}
                              alt="Pinned"
                              className="w-8 h-8 rounded object-cover border border-indigo-200"
                            />
                            <span className="text-xs font-semibold text-indigo-900">Photo</span>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-indigo-900 line-clamp-1">
                            {pinnedMsg.type === "Text"
                              ? pinnedMsg.message
                              : pinnedMsg.type === "Voice" ? "Voice Message" : "File Attachment"}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (token)
                            unpinMessage(token, pinnedMsg.id).then(() =>
                              setActiveChatMessages((p) =>
                                p.map((m) =>
                                  m.id === pinnedMsg.id
                                    ? { ...m, pinned_expires_at: null }
                                    : m
                                )
                              )
                            );
                        }}
                        className="text-indigo-400 hover:text-indigo-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loadingMessages ? (
                      <div className="flex justify-center h-full items-center">
                        <Loader2 className="animate-spin text-indigo-400" />
                      </div>
                    ) : activeChatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400">
                          <Send className="w-8 h-8 opacity-50" />
                        </div>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      activeChatMessages.map((msg) => {
                        const isMe = msg.sender_id !== activeChatId; // Simplistic check: if sender is NOT the active chat user, it's me. Ideally check against own ID.
                        // Wait, fetching message returns sender_id. If sender_id === activeChatId (partner), then 'other'. Else 'me'.
                        const sentByMe = msg.sender_id !== activeChatId;

                        return (
                          <div
                            key={msg.id}
                            className="group flex items-start gap-3 w-full hover:bg-gray-300 transition-colors cursor-pointer p-2 rounded-xl"
                          >
                            {selectionMode && (
                              <div className="self-center shrink-0 animate-in fade-in zoom-in duration-200">
                                <button
                                  onClick={() => handleMessageClick(msg, {} as any)}
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedMessages.includes(msg.id)
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-gray-300 bg-white"
                                    }`}
                                >
                                  {selectedMessages.includes(msg.id) && (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}

                            <div
                              onClick={(e) => handleMessageClick(msg, e)}
                              className={`flex gap-3 flex-1 ${sentByMe ? "justify-end" : "justify-start"
                                } cursor-pointer`}
                            >
                              {!sentByMe && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-1 shadow-sm bg-indigo-100 text-[#5479EE] overflow-hidden">
                                  {activeChatUser.user_avatar ? (
                                    <img
                                      src={activeChatUser.user_avatar}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    activeChatUser.user_avatar_initial
                                  )}
                                </div>
                              )}

                              <div
                                className={`flex flex-col max-w-[75%] ${sentByMe ? "items-end" : "items-start"
                                  }`}
                              >
                                {msg.type === "Image" ? (
                                  <div
                                    className={`rounded-[12px] p-2 shadow-sm hover:opacity-95 transition-opacity ${sentByMe
                                      ? "bg-indigo-600 rounded-br-none"
                                      : "bg-white rounded-bl-none border border-gray-100"
                                      }`}
                                  >
                                    <img
                                      src={msg.localPreviewUrl || msg.media_url || ""}
                                      alt="attachment"
                                      loading="lazy"
                                      onClick={() =>
                                        setPreviewImage({
                                          url:
                                            msg.media_url ||
                                            msg.localPreviewUrl ||
                                            "",
                                          id: msg.id,
                                          sender: sentByMe
                                            ? "You"
                                            : activeChatUser?.user_fullname ||
                                            "Unknown",
                                          time: msg.created_at,
                                          avatar: sentByMe
                                            ? null
                                            : activeChatUser?.user_avatar || null,
                                          initial: sentByMe
                                            ? "Y"
                                            : activeChatUser?.user_avatar_initial ||
                                            "?",
                                        })
                                      }
                                      className={`rounded-lg w-full h-[150px] md:h-[200px] object-cover bg-gray-100 mb-2 cursor-pointer hover:opacity-95 transition-opacity ${msg.isPending ? "blur-sm brightness-90" : ""
                                        }`}
                                    />
                                    {msg.isPending && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-md" />
                                      </div>
                                    )}
                                    {msg.message && (
                                      <div
                                        className={`px-2 pb-1 text-[13px] font-medium leading-relaxed ${sentByMe ? "text-white" : "text-gray-700"
                                          }`}
                                      >
                                        {msg.message}
                                      </div>
                                    )}
                                  </div>
                                ) : msg.type === "File" ? (
                                  <div
                                    className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed shadow-sm flex items-center gap-2 ${sentByMe
                                      ? "bg-indigo-600 text-white rounded-br-none"
                                      : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                      }`}
                                  >
                                    <div className="p-2 bg-white/20 rounded-lg">
                                      <Download className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <a
                                        href={msg.media_url || "#"}
                                        target="_blank"
                                        className="font-semibold underline"
                                      >
                                        Download File
                                      </a>
                                      <span className="text-[10px] opacity-80">
                                        Attachment
                                      </span>
                                    </div>
                                  </div>
                                ) : msg.type === "Voice" ? (
                                  <VoiceMessageBubble
                                    src={msg.localPreviewUrl || msg.media_url || ""}
                                    isMe={sentByMe}
                                  />
                                ) : (
                                  <div
                                    className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed shadow-sm ${sentByMe
                                      ? "bg-indigo-600 text-white rounded-br-none"
                                      : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                      }`}
                                  >
                                    {msg.message}
                                  </div>
                                )}

                                <span className="text-[10px] font-medium text-gray-400 mt-1.5 flex items-center gap-1 px-1">
                                  {sentByMe && (
                                    <span className={`text-indigo-500`}>
                                      {msg.is_read ? "✓✓" : "✓"}
                                    </span>
                                  )}
                                  {new Date(msg.created_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {showBubbleOptions && (
                    <div
                      ref={bubbleOptionsRef}
                      className="fixed bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 w-40"
                      style={{ top: showBubbleOptions.y, left: showBubbleOptions.x }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBubbleOptions(null);
                          toggleSelectionMode();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                      >
                        Select Messages
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinClick(showBubbleOptions.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                      >
                        Pin Chat
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors" onClick={(e) => {
                        e.stopPropagation();
                        // Call unified handler
                        handleDeleteSelected(showBubbleOptions.id);
                      }}>
                        Delete Chat
                      </button>
                    </div>
                  )}

                  <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                    {selectionMode ? (
                      <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-in slide-in-from-bottom-2 fade-in">
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-sm font-semibold text-indigo-900">
                            {selectedMessages.length} Selected
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDeleteSelected()}
                            className="p-2 text-[#5479EE] hover:bg-white rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="w-px h-6 bg-indigo-200"></div>
                          <button
                            onClick={toggleSelectionMode}
                            className="p-2 text-gray-500 hover:bg-white rounded-lg transition-all hover:text-red-500"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-50 p-1.5 pl-4 rounded-[16px] border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-sm">
                        <input
                          type="text"
                          placeholder="Type your message here..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400 h-10"
                        />
                        <div className="flex items-center gap-1 text-gray-400 pr-2">
                          {isRecording ? (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-4">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-xs font-medium text-red-600 min-w-[35px]">
                                {formatDuration(recordingDuration)}
                              </span>
                              <button
                                onClick={cancelRecording}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={stopRecording}
                                className="p-1.5 ml-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={startRecording}
                              className="p-2 hover:text-[#5479EE] hover:bg-white rounded-full transition-all"
                            >
                              <Mic className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="p-2 hover:text-[#5479EE] hover:bg-white rounded-full transition-all"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 px-5 shadow-sm hover:shadow-md active:scale-95"
                        >
                          <span className="text-sm font-semibold hidden md:inline">
                            Send
                          </span>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                        A
                      </div>
                      <h3 className="text-xl font-bold text-indigo-700">
                        Upload Files
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsUploadModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div
                    className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-indigo-50/30 group hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-[#5479EE]" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">
                      Choose a file or drag & drop it here
                    </h4>
                    <p className="text-xs text-gray-400 text-center mb-4">
                      JPEG, PNG and PDF formats
                    </p>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Modal */}
            {showContactInfo && activeChatUser && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="h-24 relative">
                    <button
                      onClick={() => setShowContactInfo(false)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white"
                    >
                      <X className="w-5 h-5 text-black" />
                    </button>
                  </div>
                  <div className="px-6 pb-8 -mt-12 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-50 flex items-center justify-center mb-3">
                      {activeChatUser.user_avatar ? (
                        <img
                          src={activeChatUser.user_avatar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-[#5479EE]">
                          {activeChatUser.user_avatar_initial}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[18px] font-normal text-[#262B43/90] mb-1">
                      {activeChatUser.user_fullname}
                    </h3>
                    <p className="text-[15px] font-normal text-[#262B43/70] mb-6">
                      {activeChatUser.user_position}
                    </p>

                    <div className="text-left space-y-6">
                      {/* Placeholder for backend fields */}
                      <div className="text-xs text-gray-400">
                        <h3 className="text-[15px] font-normal text-gray-500 mb-3">
                          ABOUT
                        </h3>
                        <p className="flex items-center gap-2 text-[15px] text-[#262B43/90]">
                          {`${activeChatUser.about
                            ? activeChatUser.about
                            : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."
                            }`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        <h3 className="text-[15px] font-normal text-gray-500 mb-3">
                          PERSONAL INFORMATION
                        </h3>
                        <p className="flex items-center gap-2 text-[15px] text-[#262B43/90]">
                          <MailIcon className="w-5 h-5" />{" "}
                          {activeChatUser.email}
                        </p>
                        <p className="flex items-center gap-2 mt-2 text-[15px] text-[#262B43/90]">
                          <PhoneIcon className="w-5 h-5" />{" "}
                          {activeChatUser.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pin Modal */}
            {showPinModal && (
              <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-indigo-700">
                        Choose how long your pin lasts
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-8">
                    {PIN_DURATIONS.map((duration) => (
                      <div
                        key={duration}
                        onClick={() => setPinDuration(duration)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${pinDuration === duration
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300"
                            }`}
                        >
                          {pinDuration === duration && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {duration}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="px-6 py-2 text-[#5479EE] font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPin}
                      className="px-8 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md"
                    >
                      Pin
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {deleteType === 'conversation' ? "Delete Conversation?" : "Delete Message?"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {deleteType === 'conversation'
                        ? "Are you sure you want to delete this conversation? This action cannot be undone and all messages will be lost."
                        : `Are you sure you want to delete ${messagesToDelete.length > 1 ? `${messagesToDelete.length} messages` : "this message"}? This action cannot be undone.`}
                    </p>

                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setMessagesToDelete([]);
                          setDeleteType(null);
                        }}
                        className="flex-1 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={executeDelete}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        // CONTACT LIST VIEW
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200/60 flex flex-col flex-1 overflow-hidden h-full">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4">
            <button
              onClick={() => setViewMode("inbox")}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg font-bold text-[#5479EE]">
              Start Conversation
            </h2>
          </div>

          <div className="px-6 py-4">{/* Search input placeholder */}</div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {Object.keys(groupedContacts)
              .sort()
              .map((letter) => (
                <div key={letter} className="mb-6">
                  <h3 className="text-[#5479EE] font-bold text-lg mb-3">
                    {letter}
                  </h3>
                  <div className="space-y-4">
                    {groupedContacts[letter].map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-100 text-[#5479EE]`}
                          >
                            {contact.avatar ? (
                              <img
                                src={contact.avatar}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              contact.avatar_initial
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#5479EE] transition-colors">
                              {contact.fullname}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {contact.position}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold overflow-hidden">
                {previewImage.avatar ? <img src={previewImage.avatar} className="w-full h-full object-cover" /> : previewImage.initial}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{previewImage.sender}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{new Date(previewImage.time).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[#5479EE]">
              <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomIn className="w-5 h-5" /></button>
              <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomOut className="w-5 h-5" /></button>
              <button onClick={() => {
                setPreviewImage(null);
                handlePinFromPreview()
              }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Pin className="w-5 h-5" /></button>
              <button onClick={handleDownloadImage} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Download className="w-5 h-5" /></button>
              {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><UploadCloud className="w-5 h-5" /></button> */}
              <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
            <img
              src={previewImage.url}
              className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

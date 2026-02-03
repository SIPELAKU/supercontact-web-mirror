"use client";

import PageHeader from "@/components/ui/page-header";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Mail,
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
  ZoomOut
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types
interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
  isImage?: boolean;
  image?: string;
}

interface Chat {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline";
  lastMessageDate: string;
  messages: Message[];
  email: string;
  phone: string;
}

// Mock Data
const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    name: "Felecia Rower",
    role: "Sales Representative",
    avatar: "bg-purple-100 text-purple-600",
    status: "online",
    lastMessageDate: "Apr 10",
    email: "felecia_rower@email.com",
    phone: "+1(123) 456 - 7890",
    messages: [
      {
        id: 1,
        text: "How can we help? We're here for you!",
        sender: "me",
        time: "1:15 PM",
      },
      {
        id: 2,
        text: "Hey John, I am looking for the best admin template. Could you please help me to find it out?",
        sender: "other",
        time: "1:15 PM",
      },
      {
        id: 3,
        text: "It should be MUI v5 compatible.",
        sender: "other",
        time: "1:15 PM",
      },
      {
        id: 4,
        text: "Absolutely!",
        sender: "me",
        time: "1:16 PM",
      },
      {
        id: 5,
        text: "This admin template is built with MUI!",
        sender: "me",
        time: "1:16 PM",
      },
      {
        id: 6,
        text: "This image",
        sender: "me",
        time: "1:21 PM",
        isImage: true,
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
      },
      {
        id: 7,
        text: "Looks clean and fresh UI. 😍",
        sender: "other",
        time: "1:17 PM",
      },
    ],
  },
  {
    id: 2,
    name: "Adalberto Granzin",
    role: "Marketing",
    avatar: "bg-red-100 text-red-600",
    status: "online",
    lastMessageDate: "Apr 8",
    email: "adalberto@email.com",
    phone: "+1(123) 555 - 0199",
    messages: [],
  },
  {
    id: 3,
    name: "Zenia Jacobs",
    role: "Admin",
    avatar: "bg-green-100 text-green-600",
    status: "online",
    lastMessageDate: "Jan 16",
    email: "zenia@email.com",
    phone: "+1(123) 555 - 0123",
    messages: [],
  },
  {
    id: 4,
    name: "Heather Gislason",
    role: "Sales",
    avatar: "bg-blue-100 text-blue-600",
    status: "online",
    lastMessageDate: "Jan 20",
    email: "heather@email.com",
    phone: "+1(123) 555 - 0145",
    messages: [],
  },
  {
    id: 5,
    name: "Rosemary Hettinger",
    role: "Marketing",
    avatar: "bg-orange-100 text-orange-600",
    status: "offline",
    lastMessageDate: "Jan 22",
    email: "rosemary@email.com",
    phone: "+1(123) 555 - 0167",
    messages: [],
  },
];

// Helper to sort chats alphabetically for the contact list view
const sortedContacts = [...MOCK_CHATS].sort((a, b) => a.name.localeCompare(b.name));
const groupedContacts = sortedContacts.reduce((acc, chat) => {
  const letter = chat.name.charAt(0).toUpperCase();
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(chat);
  return acc;
}, {} as Record<string, Chat[]>);


export default function InboxClient() {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [viewMode, setViewMode] = useState<"inbox" | "contacts">("inbox");

  // Interaction Types
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showBubbleOptions, setShowBubbleOptions] = useState<{ id: number, x: number, y: number } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  // Modals & Overlays
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMessageData, setPinMessageData] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [pinDuration, setPinDuration] = useState<string | null>(null);

  const activeChat = activeChatId ? chats.find((c) => c.id === activeChatId) : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatOptionsRef = useRef<HTMLDivElement>(null);
  const bubbleOptionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

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

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageInput,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessageInput("");
  };

  const handleAttachment = () => {
    setIsUploadModalOpen(true);
  };

  const handleVoiceNote = () => {
    alert("Voice Note clicked (Visual Only)");
  };

  const handleStartConversation = () => {
    setViewMode("contacts");
    setActiveChatId(null);
  }

  const handleSelectContact = (chatId: number) => {
    setActiveChatId(chatId);
    setViewMode("inbox");
  }

  // Option Handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setShowChatOptions(false);
    setSelectedMessages([]);
  };

  const handleMessageClick = (msg: Message, e: React.MouseEvent) => {
    if (selectionMode) {
      if (selectedMessages.includes(msg.id)) {
        setSelectedMessages(prev => prev.filter(id => id !== msg.id));
      } else {
        setSelectedMessages(prev => [...prev, msg.id]);
      }
    } else {
      // Show Bubble Options
      e.stopPropagation();
      // Calculate position relative to container, or just use click coordinates for simplicity
      // Using fixed positioning near the click
      setShowBubbleOptions({ id: msg.id, x: e.clientX, y: e.clientY });
    }
  };

  const handlePinClick = (msgId: number) => {
    const msg = activeChat?.messages.find(m => m.id === msgId);
    if (msg) {
      setPinMessageData(msg);
      setShowPinModal(true);
      setShowBubbleOptions(null);
    }
  };

  const confirmPin = () => {
    if (pinMessageData) {
      setPinnedMessage(pinMessageData);
      setShowPinModal(false);
      setPinMessageData(null);
    }
  };

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
            <div className={`w-full md:w-[320px] lg:w-[350px] flex flex-col border-r border-gray-100 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              {/* User Profile & Search */}
              <div className="p-5 border-b border-gray-100/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-indigo-300 transition-colors"
                    />
                  </div>
                </div>

                <h2 className="text-indigo-600 font-semibold px-1">Chats</h2>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${activeChatId === chat.id
                      ? "bg-indigo-50 border-indigo-100/50"
                      : "hover:bg-gray-50 hover:border-gray-100"
                      }`}
                  >
                    <div className="relative mr-4 shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${activeChatId === chat.id ? "bg-indigo-100 text-indigo-600" : chat.avatar
                          }`}
                      >
                        {chat.name.charAt(0)}
                      </div>
                      {chat.status === "online" && (
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {chat.name}
                        </h3>
                        <span className={`text-[11px] font-medium ${activeChatId === chat.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                          {chat.lastMessageDate}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${activeChatId === chat.id ? 'text-indigo-500 font-medium' : 'text-gray-500'}`}>
                        {chat.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Conversation Button - Fixed Bottom */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleStartConversation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                  Start Conversation
                </button>
              </div>
            </div>

            {/* Right Content - Chat Window or Empty State */}
            <div className={`flex-1 flex flex-col bg-[#EEF2F6] ${activeChatId ? 'flex' : 'hidden md:flex'} relative`}>
              {!activeChat ? (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-[#F4F7FE]">
                  <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <div className="relative">
                      <MessageCircle className="w-16 h-16 text-indigo-500 fill-indigo-500/20" />
                      <MessageCircle className="w-10 h-10 text-indigo-400 fill-indigo-400/20 absolute -top-2 -right-6 transform rotate-12" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-indigo-600 mb-2">My Inbox</h2>
                  <p className="text-gray-500 font-medium">Send and receive Messages</p>
                </div>
              ) : (
                // Active Chat Content
                <>
                  {/* Chat Header */}
                  <div className="bg-white/80 backdrop-blur-md p-4 px-6 border-b border-gray-200/60 sticky top-0 z-10 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Back button for mobile */}
                        <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
                          <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${activeChat.avatar}`}
                          >
                            {activeChat.name.charAt(0)}
                          </div>
                          {activeChat.status === "online" && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {activeChat.name}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${activeChat.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                            <p className="text-xs text-gray-500 capitalize">{activeChat.status}</p>
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

                        {/* Header Dropdown Menu */}
                        {showChatOptions && (
                          <div ref={chatOptionsRef} className="absolute top-10 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => { setShowContactInfo(true); setShowChatOptions(false) }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              Contact Info
                            </button>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              Mute Notification
                            </button>
                            <button
                              onClick={toggleSelectionMode}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              Select Messages
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                              Delete Chat
                            </button>
                            <button
                              onClick={() => { setPinnedMessage(null); setShowChatOptions(false) }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              Clear Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pinned Message Banner */}
                  {pinnedMessage && (
                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <Pin className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-indigo-900 line-clamp-1">{pinnedMessage.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeChat.messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400">
                          <Send className="w-8 h-8 opacity-50" />
                        </div>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      activeChat.messages.map((msg) => (
                        <div key={msg.id} className="group flex items-start gap-3 w-full">
                          {/* Checkbox for Selection Mode */}
                          {selectionMode && (
                            <div className="self-center shrink-0 animate-in fade-in zoom-in duration-200">
                              <button
                                onClick={() => handleMessageClick(msg, {} as any)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedMessages.includes(msg.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}
                              >
                                {selectedMessages.includes(msg.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}

                          <div
                            onClick={(e) => handleMessageClick(msg, e)}
                            className={`flex gap-3 flex-1 ${msg.sender === "me" ? "justify-end" : "justify-start"} cursor-pointer hover:bg-gray-300 rounded-xl p-2`}
                          >
                            {msg.sender === "other" && (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-1 shadow-sm ${activeChat.avatar}`}
                              >
                                {activeChat.name.charAt(0)}
                              </div>
                            )}

                            <div className={`flex flex-col max-w-[75%] ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                              {msg.isImage ? (
                                <div
                                  className={`rounded-[12px] p-2 shadow-sm hover:opacity-95 transition-opacity ${msg.sender === "me"
                                    ? "bg-indigo-600 rounded-br-none"
                                    : "bg-white rounded-bl-none border border-gray-100"
                                    }`}
                                  onClick={(e) => {
                                    if (selectionMode) return;
                                    e.stopPropagation();
                                    setPreviewImage(msg.image || null);
                                  }}
                                >
                                  <img
                                    src={msg.image}
                                    alt="attachment"
                                    className="rounded-lg w-full h-[150px] md:h-[200px] object-cover bg-gray-100 mb-2"
                                  />
                                  <div className={`px-2 pb-1 text-[13px] font-medium leading-relaxed ${msg.sender === "me" ? "text-white" : "text-gray-700"}`}>
                                    {msg.text}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed shadow-sm ${msg.sender === "me"
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                    }`}
                                >
                                  {msg.text}
                                </div>
                              )}


                              <span className="text-[10px] font-medium text-gray-400 mt-1.5 flex items-center gap-1 px-1">
                                {msg.sender === "me" && <span className="text-indigo-500">✓✓</span>}
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Bubble Options Pop-up */}
                  {showBubbleOptions && (
                    <div
                      ref={bubbleOptionsRef}
                      className="fixed bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 w-40"
                      style={{ top: showBubbleOptions.y, left: showBubbleOptions.x }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowBubbleOptions(null); toggleSelectionMode(); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Select Messages
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePinClick(showBubbleOptions.id); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Pin Chat
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                        Delete Chat
                      </button>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                    {selectionMode ? (
                      // Selection Mode Toolbar
                      <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-in slide-in-from-bottom-2 fade-in">
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-sm font-semibold text-indigo-900">{selectedMessages.length} Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all" title="Download">
                            <Download className="w-5 h-5" />
                          </button>
                          <div className="w-px h-6 bg-indigo-200"></div>
                          <button
                            onClick={toggleSelectionMode}
                            className="p-2 text-gray-500 hover:bg-white rounded-lg transition-all hover:text-red-500" title="Cancel">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Standard Input
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
                          <button onClick={handleVoiceNote} className="p-2 hover:text-indigo-600 hover:bg-white rounded-full transition-all">
                            <Mic className="w-5 h-5" />
                          </button>
                          <button onClick={handleAttachment} className="p-2 hover:text-indigo-600 hover:bg-white rounded-full transition-all">
                            <Paperclip className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 px-5 shadow-sm hover:shadow-md active:scale-95"
                        >
                          <span className="text-sm font-semibold hidden md:inline">Send</span>
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
                      <h3 className="text-xl font-bold text-indigo-700">Upload Files</h3>
                    </div>
                    <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Select and upload the files of your choice</p>

                  <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-indigo-50/30 group hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">Choose a file or drag & drop it here</h4>
                    <p className="text-xs text-gray-400 text-center mb-4">JPEG, PNG and PDF formats, up to 2MB</p>
                    <button className="px-6 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all text-sm font-medium">
                      Browse File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Modal */}
            {showContactInfo && activeChat && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="h-24 relative">
                    <button onClick={() => setShowContactInfo(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                      <X className="w-5 h-5 text-black" />
                    </button>
                  </div>
                  <div className="px-6 pb-8 -mt-12 text-center">
                    <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto flex items-center justify-center text-3xl font-bold mb-3 ${activeChat.avatar}`}>
                      {activeChat.name.charAt(0)}
                      {activeChat.status === "online" && (
                        <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{activeChat.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">{activeChat.role}</p>

                    <div className="text-left space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</p>
                        <p className="text-sm text-gray-600 leading-relaxed">It is a long established fact that a reader will be distracted by the readable content.</p>
                      </div>
                      <div className="h-px bg-gray-100"></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{activeChat.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{activeChat.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pin Modal */}
            {showPinModal && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-indigo-700">Choose how long your pin lasts</h3>
                      <p className="text-xs text-gray-400 mt-1">You can unpin at any time.</p>
                    </div>
                    <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-8">
                    {["24 hours", "7 days", "30 days"].map((duration) => (
                      <div
                        key={duration}
                        onClick={() => setPinDuration(duration)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${pinDuration === duration ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"}`}>
                          {pinDuration === duration && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{duration}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="px-6 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPin}
                      className="px-8 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                      Pin
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      ) : (
        // CONTACT LIST VIEW (Full height to replace the other view)
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200/60 flex flex-col flex-1 overflow-hidden h-full">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4">
            <button onClick={() => setViewMode("inbox")} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg font-bold text-indigo-600">Start Conversation</h2>
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Name"
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Grouped Contact List */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {Object.keys(groupedContacts).sort().map((letter) => (
              <div key={letter} className="mb-6">
                <h3 className="text-indigo-600 font-bold text-lg mb-3">{letter}</h3>
                <div className="space-y-4">
                  {groupedContacts[letter].map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.id)}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${contact.avatar}`}>
                          {contact.name.charAt(0)}
                          {contact.status === "online" && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{contact.name}</h4>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{contact.lastMessageDate}</span>
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
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">You</h3>
                <p className="text-xs text-gray-500 line-clamp-1">13/10/2025 at 1:21 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-indigo-600">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomIn className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomOut className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Paperclip className="w-5 h-5 rotate-45" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Download className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><UploadCloud className="w-5 h-5" /></button>
              <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-sm ring-4 ring-indigo-500/10" />
            </div>
          </div>

          <div className="p-4 text-center bg-white border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600">This Image</p>
          </div>
        </div>
      )}
    </div>
  );
}

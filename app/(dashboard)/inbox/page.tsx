"use client";

import PageHeader from "@/components/ui-mui/page-header";
import {
  Search,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  Smile,
  Phone,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

// Types
interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
  isImage?: boolean; // For future expansion (mock attachment)
}

interface Chat {
  id: number;
  name: string;
  role: string;
  avatar: string; // Color code or image path
  status: "online" | "offline";
  lastMessageDate: string;
  messages: Message[];
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
        text: "Looks clean and fresh UI. 😍",
        sender: "other",
        time: "1:17 PM",
      },
      {
        id: 7,
        text: "It's perfect for my next project.",
        sender: "other",
        time: "1:17 PM",
      },
      {
        id: 8,
        text: "How can I purchase it?",
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
    messages: [],
  },
  {
    id: 3,
    name: "Zenia Jacobs",
    role: "Admin",
    avatar: "bg-green-100 text-green-600",
    status: "online",
    lastMessageDate: "Jan 16",
    messages: [],
  },
  {
    id: 4,
    name: "Heather Gislason",
    role: "Sales",
    avatar: "bg-blue-100 text-blue-600",
    status: "online",
    lastMessageDate: "Jan 20",
    messages: [],
  },
  {
    id: 5,
    name: "Rosemary Hettinger",
    role: "Marketing",
    avatar: "bg-orange-100 text-orange-600",
    status: "offline",
    lastMessageDate: "Jan 22",
    messages: [],
  },
];

export default function InboxPage() {
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

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
    alert("Attachment clicked (Visual Only)");
  };

  const handleVoiceNote = () => {
    alert("Voice Note clicked (Visual Only)");
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col gap-6 p-4 md:p-8 overflow-hidden">
      {/* Header Section */}
      <div className="shrink-0">
        <PageHeader
          title="My Inbox"
          breadcrumbs={[{ label: "Dashboard" }, { label: "Inbox" }]}
        />
      </div>

      {/* Main Content Card - Split View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Chat List */}
        <div className={`w-full md:w-[350px] flex flex-col border-r border-gray-100 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          {/* User Profile & Search */}
          <div className="p-4 border-b border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">
                M
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <h2 className="text-blue-600 font-semibold px-1">Chats</h2>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  activeChatId === chat.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="relative mr-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${chat.avatar}`}
                  >
                    {chat.name.charAt(0)}
                  </div>
                  {chat.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-blue-700' : 'text-gray-800'}`}>
                      {chat.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {chat.lastMessageDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                     {chat.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Chat Window */}
        <div className={`flex-1 flex flex-col bg-[#F4F7FE] ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
            <div className="flex items-center gap-3">
               {/* Back button for mobile */}
              <button onClick={() => setActiveChatId(0)} className="md:hidden text-gray-500 mr-2">
                 ←
              </button>
              
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeChat.avatar}`}
                >
                  {activeChat.name.charAt(0)}
                </div>
                {activeChat.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  {activeChat.name}
                </h3>
                <p className="text-xs text-gray-500">{activeChat.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeChat.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No messages yet. Say hello!
                </div>
            ) : (
                activeChat.messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex gap-3 ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                >
                    {msg.sender === "other" && (
                     <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-1 ${activeChat.avatar}`}
                      >
                        {activeChat.name.charAt(0)}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[70%] ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                        <div
                            className={`p-3 rounded-2xl text-sm shadow-sm ${
                            msg.sender === "me"
                                ? "bg-[#6366F1] text-white rounded-br-none"
                                : "bg-white text-gray-700 rounded-bl-none"
                            }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            {msg.sender === "me" && <span className="text-green-500">✓✓</span>}
                            {msg.time}
                        </span>
                    </div>

                     {msg.sender === "me" && (
                     <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold self-end mb-1">
                        M
                      </div>
                    )}
                </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input
                type="text"
                placeholder="Type your message here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
              />
              <div className="flex items-center gap-1 text-gray-400">
                 <button onClick={handleVoiceNote} className="p-2 hover:text-gray-600 transition-colors">
                    <Mic className="w-5 h-5" />
                 </button>
                 <button onClick={handleAttachment} className="p-2 hover:text-gray-600 transition-colors">
                    <Paperclip className="w-5 h-5" />
                 </button>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-[#6366F1] text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 px-4 shadow-sm"
              >
                  <span className="text-sm font-medium hidden md:inline">Send</span>
                  <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

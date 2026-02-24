"use client";

import PageHeader from "@/components/ui/page-header";
import { MessageCircle, Pin, X } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@/lib/hooks/useChat";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ContactList from "./ContactList";
import ChatModals from "./ChatModals";
import { unpinMessage } from "@/lib/api/chat";

export default function InboxClient() {
  const chat = useChat();

  const chatOptionsRef = useRef<HTMLDivElement>(null);
  const bubbleOptionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOptionsRef.current && !chatOptionsRef.current.contains(event.target as Node)) {
        chat.setShowChatOptions(false);
      }
      if (bubbleOptionsRef.current && !bubbleOptionsRef.current.contains(event.target as Node)) {
        chat.setShowBubbleOptions(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chat]);

  const handleMessageClick = (msg: any, e: React.MouseEvent) => {
    if (chat.selectionMode) {
      if (chat.selectedMessages.includes(msg.id)) {
        chat.setSelectedMessages((prev: string[]) => prev.filter((id) => id !== msg.id));
      } else {
        chat.setSelectedMessages((prev: string[]) => [...prev, msg.id]);
      }
    } else {
      e.stopPropagation();
      chat.setShowBubbleOptions({ id: msg.id, x: e.clientX, y: e.clientY });
    }
  };

  const handlePinClick = (msgId: string) => {
    chat.setPinMessageId(msgId);
    chat.setShowPinModal(true);
    chat.setShowBubbleOptions(null);
  };

  const handleDeleteSelected = (msgId?: string) => {
    if (msgId) {
      chat.setMessagesToDelete([msgId]);
    } else {
      if (chat.selectedMessages.length === 0) return;
      chat.setMessagesToDelete(chat.selectedMessages);
    }
    chat.setDeleteType("messages");
    chat.setShowDeleteModal(true);
    chat.setShowBubbleOptions(null);
  };

  const pinnedMsg = chat.activeChatMessages.find(
    (m) => m.pinned_expires_at && new Date(m.pinned_expires_at) > new Date()
  );

  const handleZoomIn = () => chat.setZoomLevel((prev: number) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => chat.setZoomLevel((prev: number) => Math.max(prev - 0.25, 0.5));

  const handleDownloadImage = async () => {
    if (!chat.previewImage) return;
    try {
      const response = await fetch(chat.previewImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const handlePinFromPreview = () => {
    if (chat.previewImage) {
      handlePinClick(chat.previewImage.id);
    }
  };

  useEffect(() => {
    if (chat.previewImage) chat.setZoomLevel(1);
  }, [chat.previewImage]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6 h-[calc(100vh)] flex flex-col gap-5 overflow-hidden bg-transparent">
      {chat.viewMode === "inbox" ? (
        <>
          <PageHeader title="My Inbox" breadcrumbs={[{ label: "Dashboard" }, { label: "My Inbox" }]} />

          <div className="bg-white rounded-[16px] shadow-sm border border-gray-200/60 flex flex-1 overflow-hidden relative">
            <ChatSidebar
              inboxList={chat.inboxList}
              activeChatId={chat.activeChatId}
              setActiveChatId={(id) => chat.setActiveChatId(id)}
              searchTerm={chat.searchTerm}
              setSearchTerm={(term) => chat.setSearchTerm(term)}
              loadingInbox={chat.loadingInbox}
              onStartConversation={() => chat.setViewMode("contacts")}
            />

            <div className={`flex-1 flex flex-col bg-[#EEF2F6] ${chat.activeChatId ? "flex" : "hidden md:flex"} relative`}>
              {!chat.activeChatId || !chat.activeChatUser ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-[#F4F7FE]">
                  <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <div className="relative">
                      <MessageCircle className="w-16 h-16 text-indigo-500 fill-indigo-500/20" />
                      <MessageCircle className="w-10 h-10 text-indigo-400 fill-indigo-400/20 absolute -top-2 -right-6 transform rotate-12" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#5479EE] mb-2">My Inbox</h2>
                  <p className="text-gray-500 font-medium">Select a conversation or start a new one.</p>
                </div>
              ) : (
                <>
                  <ChatHeader
                    activeChatUser={chat.activeChatUser}
                    setActiveChatId={(id) => chat.setActiveChatId(id)}
                    showChatOptions={chat.showChatOptions}
                    setShowChatOptions={(show) => chat.setShowChatOptions(show)}
                    chatOptionsRef={chatOptionsRef}
                    setShowContactInfo={(show) => chat.setShowContactInfo(show)}
                    toggleSelectionMode={() => chat.setSelectionMode(!chat.selectionMode)}
                    setDeleteType={(type) => chat.setDeleteType(type)}
                    setShowDeleteModal={(show) => chat.setShowDeleteModal(show)}
                  />

                  {pinnedMsg && (
                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <Pin className="w-4 h-4 text-[#5479EE] shrink-0 fill-indigo-600" />
                      <div className="flex-1 min-w-0">
                        {pinnedMsg.type === "Image" ? (
                          <div className="flex items-center gap-2">
                            <img src={pinnedMsg.media_url || pinnedMsg.localPreviewUrl || ""} alt="Pinned" className="w-8 h-8 rounded object-cover border border-indigo-200" />
                            <span className="text-xs font-semibold text-indigo-900">Photo</span>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-indigo-900 line-clamp-1">
                            {pinnedMsg.type === "Text" ? pinnedMsg.message : pinnedMsg.type === "Voice" ? "Voice Message" : "File Attachment"}
                          </p>
                        )}
                      </div>
                      <button onClick={() => chat.unpin(pinnedMsg.id)} className="text-indigo-400 hover:text-indigo-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <MessageList
                    loadingMessages={chat.loadingMessages}
                    activeChatMessages={chat.activeChatMessages}
                    activeChatId={chat.activeChatId}
                    activeChatUser={chat.activeChatUser}
                    selectionMode={chat.selectionMode}
                    selectedMessages={chat.selectedMessages}
                    handleMessageClick={handleMessageClick}
                    setPreviewImage={(preview) => chat.setPreviewImage(preview)}
                    messagesEndRef={chat.messagesEndRef}
                  />

                  {chat.showBubbleOptions && (
                    <div
                      ref={bubbleOptionsRef}
                      className="fixed bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 w-40"
                      style={{ top: chat.showBubbleOptions.y, left: chat.showBubbleOptions.x }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); chat.setShowBubbleOptions(null); chat.setSelectionMode(true); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                      >
                        Select Messages
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePinClick(chat.showBubbleOptions!.id); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                      >
                        Pin Chat
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteSelected(chat.showBubbleOptions!.id); }}>
                        Delete Chat
                      </button>
                    </div>
                  )}

                  <ChatInput
                    selectionMode={chat.selectionMode}
                    selectedMessages={chat.selectedMessages}
                    handleDeleteSelected={handleDeleteSelected}
                    toggleSelectionMode={() => chat.setSelectionMode(!chat.selectionMode)}
                    messageInput={chat.messageInput}
                    setMessageInput={(input) => chat.setMessageInput(input)}
                    handleSendMessage={chat.handleSendMessage}
                    isRecording={chat.isRecording}
                    recordingDuration={chat.recordingDuration}
                    cancelRecording={chat.cancelRecording}
                    stopRecording={chat.stopRecording}
                    startRecording={chat.startRecording}
                    setIsUploadModalOpen={(open) => chat.setIsUploadModalOpen(open)}
                  />
                </>
              )}
            </div>

            <ChatModals
              isUploadModalOpen={chat.isUploadModalOpen}
              setIsUploadModalOpen={(open) => chat.setIsUploadModalOpen(open)}
              fileInputRef={fileInputRef}
              handleFileUpload={chat.handleFileUpload}
              showContactInfo={chat.showContactInfo}
              setShowContactInfo={(show) => chat.setShowContactInfo(show)}
              activeChatUser={chat.activeChatUser}
              showPinModal={chat.showPinModal}
              setShowPinModal={(show) => chat.setShowPinModal(show)}
              pinDuration={chat.pinDuration}
              setPinDuration={(duration) => chat.setPinDuration(duration)}
              confirmPin={() => chat.confirmPin()}
              showDeleteModal={chat.showDeleteModal}
              setShowDeleteModal={(show) => chat.setShowDeleteModal(show)}
              deleteType={chat.deleteType}
              messagesToDelete={chat.messagesToDelete}
              executeDelete={chat.executeDelete}
              previewImage={chat.previewImage}
              setPreviewImage={(preview: any) => chat.setPreviewImage(preview)}
              zoomLevel={chat.zoomLevel}
              handleZoomIn={handleZoomIn}
              handleZoomOut={handleZoomOut}
              handlePinFromPreview={handlePinFromPreview}
              handleDownloadImage={handleDownloadImage}
            />
          </div>
        </>
      ) : (
        <ContactList
          userList={chat.userList}
          setViewMode={(mode) => chat.setViewMode(mode)}
          onSelectContact={(user) => chat.handleSelectContact(user)}
        />
      )}
    </div>
  );
}

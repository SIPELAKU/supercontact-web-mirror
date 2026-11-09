"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { ChannelType, Message } from "@/lib/types/omnichannel";
import { format } from "date-fns";
import { CheckCheck, Check, X, Clock, ZoomIn, ZoomOut, RotateCcw, FileText, Download, Play, Pause, Volume2, ArrowDown, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  isNearBottom,
  messageListSnapshot,
  messageScrollAction,
  type MessageListSnapshot,
} from "@/lib/utils/conversationMessages";

interface MessageListProps {
  messages: Message[];
  channelType: ChannelType;
  // FE-8, optional: reaching the top loads older messages. Without
  // onLoadOlder the list shows only what it is given, as before.
  onLoadOlder?: () => void;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  loadOlderFailed?: boolean;
  // Changes when the staff sent a reply here: go to the newest message. Without
  // it, any outbound message counts as sent by the staff.
  replySentKey?: number;
}

// FE-8 scrolling: a chat opens at its newest message, without animation, and
// stays there while images load. Older messages added on top keep the message
// being read in place. A new message follows only when already at the bottom
// (or the staff sent it); otherwise "New messages" offers the way down.
const MessageList: React.FC<MessageListProps> = ({
  messages,
  channelType,
  onLoadOlder,
  hasOlder = false,
  isLoadingOlder = false,
  loadOlderFailed = false,
  replySentKey,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // Read in effects and observers, so kept out of render state.
  const atBottomRef = useRef(true);
  const snapshotRef = useRef<MessageListSnapshot | null>(null);
  // scrollHeight as last seen, to keep the reader's place when older
  // messages are added above.
  const heightRef = useRef(0);
  const [showNewMessages, setShowNewMessages] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const hasMessages = messages.length > 0;

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    atBottomRef.current = true;
    setShowNewMessages(false);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = isNearBottom(el.scrollHeight, el.scrollTop, el.clientHeight);
    if (atBottomRef.current) setShowNewMessages(false);
    heightRef.current = el.scrollHeight;
  };

  // Before paint, so a chat never shows its top first.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = messageListSnapshot(messages);
    const last = messages[messages.length - 1];
    const action = messageScrollAction(snapshotRef.current, next, {
      atBottom: atBottomRef.current,
      lastIsOutbound: replySentKey === undefined && last?.direction === "outbound",
    });
    if (action === "jump") {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
      setShowNewMessages(false);
    } else if (action === "keep") {
      el.scrollTop += el.scrollHeight - heightRef.current;
    } else if (action === "follow") {
      scrollToBottom("smooth");
    } else if (action === "notify") {
      setShowNewMessages(true);
    }
    snapshotRef.current = next;
    heightRef.current = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs per message change only
  }, [messages]);

  // The staff sent a reply here: show it, wherever they were reading.
  useEffect(() => {
    if (replySentKey) scrollToBottom("smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key is the signal
  }, [replySentKey]);

  // Images loading make the chat taller: stay at the bottom if there.
  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (atBottomRef.current) el.scrollTop = el.scrollHeight;
      heightRef.current = el.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [hasMessages]);

  // The top of the chat in view (or nearly): load the page before it. Made
  // again after every change, so a list still too short to scroll keeps
  // loading until it fills the view or nothing older is left.
  useEffect(() => {
    const root = scrollRef.current;
    const target = topRef.current;
    if (!root || !target || !onLoadOlder || !hasOlder || isLoadingOlder || loadOlderFailed) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadOlder();
      },
      { root, rootMargin: "200px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [onLoadOlder, hasOlder, isLoadingOlder, loadOlderFailed, messages.length]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-200" />;
      case 'failed':
        return <X size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const isImageAttachment = (url?: string, type?: string) => {
    if (type && (type === 'image' || type.startsWith('image/'))) return true;
    if (!url) return false;
    return /\.(jpe?g|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
  };

  const isVoiceAttachment = (type?: string) => {
    return type === 'voice' || (type && type.startsWith('audio/'));
  };

  const isFileAttachment = (type?: string) => {
    return type === 'file' || (type && (type.startsWith('application/') || type === 'text/plain'));
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
          <div ref={contentRef} className="space-y-4">
            <div ref={topRef} aria-hidden />
            {onLoadOlder && (isLoadingOlder || loadOlderFailed || !hasOlder) && (
              <div className="flex justify-center py-1 text-xs text-gray-400">
                {isLoadingOlder ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading older messages" />
                ) : loadOlderFailed ? (
                  <button type="button" onClick={onLoadOlder} className="text-[#5479EE] hover:underline">
                    Couldn&apos;t load older messages. Try again
                  </button>
                ) : (
                  <span>Beginning of conversation</span>
                )}
              </div>
            )}
            {messages.map((message) => {
              const isOutbound = message.direction === 'outbound';

              return (
                <div
                  key={message.id}
                  className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${isOutbound
                      ? 'bg-[#5479EE] text-white'
                      : 'bg-gray-300 text-gray-900'
                      }`}
                  >
                    {/* Message Content */}
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    )}

                    {/* Media Attachment */}
                    {message.media_url && (
                      <div className="mt-2">
                        {isImageAttachment(message.media_url, message.media_type) ? (
                          <div className="relative rounded overflow-hidden">
                            <Image
                              src={message.media_url}
                              alt="Attachment"
                              width={400}
                              height={300}
                              unoptimized
                              className="object-contain cursor-pointer max-w-full h-auto max-h-64"
                              style={{ width: "auto" }}
                              onClick={() => {
                                setSelectedImage(message.media_url!);
                                setScale(1);
                              }}
                            />
                          </div>
                        ) : isVoiceAttachment(message.media_type) ? (
                          <div className={`flex items-center gap-3 p-2 rounded-lg ${isOutbound ? 'bg-[#3F66E0]/50' : 'bg-gray-200'}`}>
                            <button className="p-1.5 rounded-full bg-primary text-white hover:scale-105 transition-transform">
                              <Play size={16} fill="white" />
                            </button>
                            <div className="flex-1 h-1.5 bg-gray-300 rounded-full relative overflow-hidden">
                              <div className="absolute inset-y-0 left-0 w-1/3 bg-primary" />
                            </div>
                            <Volume2 size={16} className={isOutbound ? 'text-blue-200' : 'text-gray-500'} />
                          </div>
                        ) : isFileAttachment(message.media_type) || true ? (
                          <div className={`flex items-center gap-3 p-3 rounded-lg border ${isOutbound ? 'bg-[#3F66E0]/30 border-[#5479EE]/50' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className={`p-2 rounded-lg ${isOutbound ? 'bg-[#5479EE]' : 'bg-gray-100'}`}>
                              <FileText size={20} className={isOutbound ? 'text-white' : 'text-[#5479EE]'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isOutbound ? 'text-white' : 'text-gray-900'}`}>{message.media_url.split('/').pop()}</p>
                              <p className={`text-[10px] ${isOutbound ? 'text-blue-200' : 'text-gray-500'}`}>File Attachment</p>
                            </div>
                            <a
                              href={message.media_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-full hover:scale-110 transition-transform ${isOutbound ? 'bg-[#5479EE]/50 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Timestamp and Status */}
                    <div
                      className={`flex items-center gap-1 mt-1 text-[10px] ${isOutbound ? 'text-blue-100' : 'text-gray-400'
                        }`}
                    >
                      <span>{format(new Date(message.sent_at || message.created_at), 'HH:mm')}</span>
                      {isOutbound && channelType === 'whatsapp' && (
                        <span className="ml-1">{getStatusIcon(message.status)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showNewMessages && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#5479EE] px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-[#3F66E0]"
          >
            New messages <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Fullscreen Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          {/* Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-110">
            <button
              onClick={handleZoomIn}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <ZoomIn size={22} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <ZoomOut size={22} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <RotateCcw size={22} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button
              onClick={() => setSelectedImage(null)}
              className="p-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center overflow-auto cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;

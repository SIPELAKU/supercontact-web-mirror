"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/types/omnichannel";
import { format } from "date-fns";
import { CheckCheck, Check, X, Clock, ZoomIn, ZoomOut, RotateCcw, FileText, Download, Play, Pause, Volume2 } from "lucide-react";
import Image from "next/image";

interface MessageListProps {
  messages: Message[];
  channelType: 'whatsapp' | 'email';
}

const MessageList: React.FC<MessageListProps> = ({ messages, channelType }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      <div className={`flex items-center gap-3 p-2 rounded-lg ${isOutbound ? 'bg-blue-700/50' : 'bg-gray-200'}`}>
                        <button className="p-1.5 rounded-full bg-primary text-white hover:scale-105 transition-transform">
                          <Play size={16} fill="white" />
                        </button>
                        <div className="flex-1 h-1.5 bg-gray-300 rounded-full relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 w-1/3 bg-primary" />
                        </div>
                        <Volume2 size={16} className={isOutbound ? 'text-blue-200' : 'text-gray-500'} />
                      </div>
                    ) : isFileAttachment(message.media_type) || true ? (
                      <div className={`flex items-center gap-3 p-3 rounded-lg border ${isOutbound ? 'bg-blue-700/30 border-blue-500/50' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className={`p-2 rounded-lg ${isOutbound ? 'bg-blue-600' : 'bg-gray-100'}`}>
                          <FileText size={20} className={isOutbound ? 'text-white' : 'text-blue-600'} />
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
                          className={`p-2 rounded-full hover:scale-110 transition-transform ${isOutbound ? 'bg-blue-600/50 text-white' : 'bg-gray-100 text-gray-700'}`}
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
        <div ref={messagesEndRef} />
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

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/types/omnichannel";
import { format } from "date-fns";
import { CheckCheck, Check, X, Clock } from "lucide-react";
import Image from "next/image";

interface MessageListProps {
  messages: Message[];
  channelType: 'whatsapp' | 'email';
}

const MessageList: React.FC<MessageListProps> = ({ messages, channelType }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                {/* Message Content */}
                <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>

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
                          unoptimized // Adding unoptimized as fallback for external URLs if resizing fails
                          className="object-contain cursor-pointer max-w-full h-auto max-h-64"
                          style={{ width: "auto" }}
                          onClick={() => setSelectedImage(message.media_url!)}
                          onError={(e) => {
                            // Fallback if image fails to load: replace the image container with a standard link
                            const container = e.currentTarget.closest('.relative') as HTMLElement;
                            const parent = container?.parentElement;
                            if (container && parent) {
                              container.style.display = 'none';
                              const link = document.createElement('a');
                              link.href = message.media_url!;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              link.className = `inline-block py-1.5 px-3 rounded text-sm underline ${isOutbound ? 'bg-blue-700 text-blue-100 hover:bg-blue-800/80 mr-auto' : 'bg-gray-200 text-blue-600 hover:bg-gray-300 ml-auto'
                                }`;
                              link.innerText = 'View Attachment';
                              parent.appendChild(link);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <a
                        href={message.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block py-1.5 px-3 rounded text-sm underline ${isOutbound ? 'bg-blue-700 text-blue-100 hover:bg-blue-800/80 mr-auto' : 'bg-gray-200 text-blue-600 hover:bg-gray-300 ml-auto'
                          }`}
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                )}

                {/* Timestamp and Status */}
                <div
                  className={`flex items-center gap-1 mt-1 text-xs ${isOutbound ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                  <span>{format(new Date(message.sent_at), 'HH:mm')}</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <X
              className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer w-8 h-8 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            />
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Full preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;

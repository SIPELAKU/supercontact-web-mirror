"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/lib/types/omnichannel";
import { format } from "date-fns";
import { CheckCheck, Check, X, Clock } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  channelType: 'whatsapp' | 'email';
}

const MessageList: React.FC<MessageListProps> = ({ messages, channelType }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOutbound = message.direction === 'outbound';
        
        return (
          <div
            key={message.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isOutbound
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Message Content */}
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

              {/* Media Attachment */}
              {message.media_url && (
                <div className="mt-2">
                  {message.media_type?.startsWith('image/') ? (
                    <img
                      src={message.media_url}
                      alt="Attachment"
                      className="rounded max-w-full h-auto"
                    />
                  ) : (
                    <a
                      href={message.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm underline ${
                        isOutbound ? 'text-blue-100' : 'text-blue-600'
                      }`}
                    >
                      View Attachment
                    </a>
                  )}
                </div>
              )}

              {/* Timestamp and Status */}
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  isOutbound ? 'text-blue-100' : 'text-gray-500'
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
  );
};

export default MessageList;

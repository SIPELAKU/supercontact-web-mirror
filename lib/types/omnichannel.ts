// Omnichannel Types

export interface Account {
  id: string;
  channel_type: 'whatsapp' | 'email';
  channel_identifier: string;
  display_name: string;
  is_active: boolean;
  metadata: {
    twilio_account_sid?: string;
    imap_host?: string;
    imap_port?: number;
    smtp_host?: string;
    smtp_port?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  account_id: string;
  channel_type: 'whatsapp' | 'email';
  contact_name?: string;
  contact_identifier?: string;
  external_contact_name?: string;
  external_contact_identifier?: string;
  subject?: string;
  status: 'open' | 'closed' | 'archived';
  unread_count: number;
  last_message_preview?: string;
  last_message_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  content_type?: string;
  media_url?: string;
  media_type?: string;
  sender_identifier?: string;
  external_message_id?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  created_at: string;
  attachments?: any[];
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// Request Types
export interface ConnectWhatsAppRequest {
  phone_number: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
}

export interface ConnectEmailRequest {
  email: string;
  app_password: string;
  display_name: string;
  imap_host: 'imap.gmail.com';
  imap_port: 993;
  smtp_host: 'smtp.gmail.com';
  smtp_port: 587;
}

export interface CreateConversationRequest {
  account_id: string;
  to: string;
  name: string;
  subject?: string;
  message?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface EmailRefreshRequest {
  full_sync: boolean;
}

// Response Types
export interface MediaUploadResponse {
  media_url: string;
}

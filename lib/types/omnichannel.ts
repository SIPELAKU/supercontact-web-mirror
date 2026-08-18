// Omnichannel Types

export type WhatsAppApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Account {
  id: string;
  company_id: string;
  user_id: string;
  channel_type: 'whatsapp' | 'email' | 'web_widget';
  channel_identifier: string;
  display_name: string;
  branch: string | null;
  whatsapp_status: WhatsAppApprovalStatus | null;
  imap_host?: string | null;
  imap_port?: number | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  account_id: string;
  channel_type: 'whatsapp' | 'email' | 'web_widget';
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
  sentiment_label?: "positive" | "negative" | "neutral";
  sentiment_model?: string;
  sentiment_score?: number;
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
  assigned_user_fullname?: string;
  tags: ConversationTag[];
  notes: ConversationNote[];
}

// Conversation assignment/tags/notes (Phase 3)
export interface ConversationTag {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

export interface ConversationNote {
  id: string;
  conversation_id: string;
  user_fullname: string;
  note: string;
  created_at: string;
}

export interface AssignConversationRequest {
  assigned_user_id: string | null;
}

export interface SetConversationTagsRequest {
  tags: string[];
}

export interface CreateConversationNoteRequest {
  note: string;
}

export interface CreateConversationTagRequest {
  name: string;
}

export interface ConversationTagsResponse {
  tags: ConversationTag[];
}

// Request Types
export interface ConnectWhatsAppRequest {
  phone_number: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  branch?: string;
  display_name?: string;
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

export interface ConnectWebWidgetRequest {
  display_name: string;
}

export interface UpdateAccountRequest {
  display_name?: string;
  branch?: string;
}

export interface WebWidgetConfig {
  id: string;
  account_id: string;
  title: string;
  greeting_message: string;
  brand_color: string;
  allowed_domains: string[];
  is_widget_enabled: boolean;
  auto_create_ticket: boolean;
  enable_ai_triage: boolean;
  business_hours_calendar_id?: string | null;
  offline_message?: string | null;
}

export type UpdateWebWidgetConfigRequest = Omit<WebWidgetConfig, 'id' | 'account_id'>;

export interface CreateConversationRequest {
  account_id: string;
  to?: string;
  contact_id?: string;
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

export interface OmnichannelContact {
  inbox_key: string;
  contact_id: string;
  display_name: string;
  primary_identifier: string;
  email?: string;
  phone_number?: string;
  company?: string;
  position?: string;
  channel_types: ('email' | 'whatsapp')[];
  unread_count: number;
  latest_conversation_id?: string;
  last_message_at?: string;
  last_message_preview?: string;
  subject?: string;
  is_frequent: boolean;
  frequent_message_count?: number;
  assigned_user_id?: string;
  assigned_user_fullname?: string;
}

export interface OmnichannelContactsResponse {
  contacts: OmnichannelContact[];
  total: number;
  page: number;
  limit: number;
}

// Contact-centric merged timeline (`GET /inbox/contacts/{contact_key}/timeline`).
// Used to disambiguate which conversation belongs to the active chatMode tab
// for a contact that has more than one channel (e.g. WhatsApp + Email).
export interface OmnichannelContactTimelineConversation {
  conversation_id: string;
  channel_type: 'whatsapp' | 'email' | 'web_widget';
  status: 'open' | 'closed' | 'archived';
  subject?: string;
  external_contact_identifier: string;
  external_contact_name?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  sentiment_model?: string;
  sentiment_status_message?: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
}

export interface OmnichannelContactTimelineMessage {
  id: string;
  conversation_id: string;
  channel_type: 'whatsapp' | 'email' | 'web_widget';
  direction: 'inbound' | 'outbound';
  sender_identifier: string;
  content: string;
  content_type?: string;
  media_url?: string;
  external_message_id?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  created_at: string;
  subject?: string;
  external_contact_identifier: string;
  external_contact_name?: string;
  attachments?: any[];
}

export interface OmnichannelContactTimelineResponse {
  inbox_key: string;
  contact_id?: string;
  conversations: OmnichannelContactTimelineConversation[];
  messages: OmnichannelContactTimelineMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface OmnichannelContactInboxDetail {
  inbox_key: string;
  contact_id?: string;
  is_unknown: boolean;
  name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  position?: string;
  address?: string;
  channel_types: ('whatsapp' | 'email' | 'web_widget')[];
  unread_count: number;
  open_conversation_count: number;
  latest_conversation_id?: string;
  last_message_at?: string;
}

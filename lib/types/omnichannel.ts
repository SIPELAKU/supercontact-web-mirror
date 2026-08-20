// Omnichannel Types

export type WhatsAppApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

// Full lifecycle status set that can appear on a conversation object.
export type ConversationStatus = 'open' | 'closed' | 'solved' | 'archived' | 'snoozed';
// Status values PATCH /conversations/{id}/status accepts from this UI.
// (`snoozed` is set by the backend auto-snooze flow, not directly here.)
export type SettableConversationStatus = 'open' | 'closed' | 'solved' | 'archived';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

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
  status: ConversationStatus;
  priority?: ConversationPriority;
  unread_count: number;
  last_message_preview?: string;
  last_message_at?: string;
  created_at: string;
  updated_at?: string;
  // Lifecycle timestamps (nullable - only set once the corresponding
  // transition has happened). Added with the Support Desk Phase 0 status /
  // priority / assignment work.
  snoozed_until?: string | null;
  closed_at?: string | null;
  solved_at?: string | null;
  archived_at?: string | null;
  reopened_at?: string | null;
  assigned_at?: string | null;
  first_response_at?: string | null;
  last_agent_response_at?: string | null;
  last_customer_message_at?: string | null;
  sentiment_label?: "positive" | "negative" | "neutral";
  sentiment_model?: string;
  sentiment_score?: number;
  // Computed conversation-SLA summary (Conversation SLA Phase 3). `null` (or
  // absent) means no policy matches this conversation - render nothing.
  sla?: ConversationSlaSummary | null;
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

// ---------------------------------------------------------------------------
// Conversation-FIRST inbox (Support Desk agent workspace).
//
// Distinct from the contact-first inbox (OmnichannelContact* above, backed by
// GET /omnichannels/inbox/contacts). This is the flat conversation queue that
// GET /omnichannels/inbox returns - one row per conversation, unified across
// every channel - for the Zendesk-style agent workspace.
// ---------------------------------------------------------------------------
export interface ConversationListItem {
  id: string;
  account_id: string;
  contact_id?: string | null;
  channel_type: 'whatsapp' | 'email' | 'web_widget';
  external_contact_identifier?: string;
  external_contact_name?: string;
  status: ConversationStatus;
  priority?: ConversationPriority;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
  subject?: string;
  assigned_user_id?: string | null;
  snoozed_until?: string | null;
  // Computed conversation-SLA summary (Conversation SLA Phase 3). `null` (or
  // absent) means no policy matches this conversation - render nothing.
  sla?: ConversationSlaSummary | null;
}

// Query params for GET /omnichannels/inbox. Every field is optional; omitted
// keys are dropped from the querystring rather than sent empty.
export interface ConversationInboxFilters {
  status?: ConversationStatus;
  priority?: ConversationPriority;
  assigned_to_me?: boolean;
  unassigned?: boolean;
  channel_type?: 'whatsapp' | 'email' | 'web_widget';
  q?: string;
  page?: number;
  limit?: number;
}

export interface ConversationInboxResponse {
  conversations: ConversationListItem[];
  total: number;
  page: number;
  limit: number;
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

// Status / priority controls (Support Desk Phase 0)
export interface SetConversationStatusRequest {
  status: SettableConversationStatus;
}

export interface SetConversationPriorityRequest {
  priority: ConversationPriority;
}

// Snooze (auto-reopen scheduling). PATCH /conversations/{id}/snooze.
// `snoozed_until` is an ISO-8601 UTC datetime string.
export interface SnoozeConversationRequest {
  snoozed_until: string;
}

// Hand a conversation to another agent. POST /conversations/{id}/transfer.
export interface TransferConversationRequest {
  assigned_user_id: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Conversation SLA (Conversation SLA Phase 3).
//
// Per-conversation computed summary (attached to every conversation payload as
// `sla`, `null` when no policy matches) + tenant policy CRUD under
// /omnichannels/conversation-sla/policies. Listing needs omnichannel:use;
// create/update/delete needs omnichannel:setup. A null channel_type or priority
// on a policy means "any".
// ---------------------------------------------------------------------------
export interface ConversationSlaSummary {
  policy_id: string;
  policy_name: string;
  first_response_due_at: string | null;
  first_response_met: boolean;
  first_response_breached: boolean;
  resolution_due_at: string | null;
  resolution_met: boolean;
  resolution_breached: boolean;
}

export type ConversationSlaChannelType = 'whatsapp' | 'email' | 'web_widget';

export interface ConversationSlaPolicy {
  id: string;
  name: string;
  channel_type: ConversationSlaChannelType | null;
  priority: ConversationPriority | null;
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  business_hours_calendar_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationSlaPolicyRequest {
  name: string;
  channel_type?: ConversationSlaChannelType | null;
  priority?: ConversationPriority | null;
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  business_hours_calendar_id?: string | null;
}

export type UpdateConversationSlaPolicyRequest = Partial<CreateConversationSlaPolicyRequest> & {
  is_active?: boolean;
};

// ---------------------------------------------------------------------------
// Canned replies (saved omnichannel replies with an optional "/" shortcut).
// Base /omnichannels/canned-replies. Listing + insertion needs omnichannel:use;
// create/update/delete needs omnichannel:setup.
// ---------------------------------------------------------------------------
export interface CannedReply {
  id: string;
  title: string;
  shortcut: string | null;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCannedReplyRequest {
  title: string;
  shortcut?: string | null;
  body: string;
  is_active?: boolean;
}

export interface UpdateCannedReplyRequest {
  title?: string;
  shortcut?: string | null;
  body?: string;
  is_active?: boolean;
}

// Conversation collision presence (mirrors the ticket viewers response;
// excludes the caller).
export interface ConversationViewer {
  user: { id: string; fullname: string; email: string };
  last_seen_at: string;
}

export interface ConversationViewersResponse {
  data: { data: ConversationViewer[] };
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
  channel_types: ('email' | 'whatsapp' | 'web_widget')[];
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
  status: ConversationStatus;
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

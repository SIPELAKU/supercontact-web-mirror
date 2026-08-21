// Omnichannel Types

// THE channel union. Every FE channel_type value flows through this one type -
// adding a channel (Phase 9: sms, later messenger/instagram) means extending it
// here and letting the compiler surface every switch/record that needs a new
// arm. Types that deliberately exclude a channel (e.g. the contact-first inbox
// filter, which leaves out web_widget) stay hand-written on purpose.
export type ChannelType = 'whatsapp' | 'email' | 'web_widget' | 'sms';

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
  channel_type: ChannelType;
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
  channel_type: ChannelType;
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
  // CRM organization the conversation's contact belongs to (Support Desk
  // Phase 1/2). `null` when the contact isn't linked to a company - the
  // workspace context panel renders the Organization section only when set.
  crm_company_id?: string | null;
  organization_name?: string | null;
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
  channel_type: ChannelType;
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
  // CRM organization the conversation's contact belongs to (Support Desk
  // Phase 1/2). `null`/absent when the contact isn't linked to a company.
  crm_company_id?: string | null;
  organization_name?: string | null;
}

// Query params for GET /omnichannels/inbox. Every field is optional; omitted
// keys are dropped from the querystring rather than sent empty.
export interface ConversationInboxFilters {
  status?: ConversationStatus;
  priority?: ConversationPriority;
  assigned_to_me?: boolean;
  unassigned?: boolean;
  channel_type?: ChannelType;
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

export type ConversationSlaChannelType = ChannelType;

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

// Phase 9 Inc A: connect an SMS number (POST /omnichannels/accounts/sms).
// Mirrors the WhatsApp connect envelope - same Twilio credentials, no
// whatsapp-specific approval flow and no branch field.
export interface ConnectSmsRequest {
  display_name?: string;
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

export interface ConnectWebWidgetRequest {
  display_name: string;
}

export interface UpdateAccountRequest {
  display_name?: string;
  branch?: string;
}

// One visitor-facing "option card" rendered on the widget home screen. The
// widget client (widget/, owned separately) renders `icon` from a FIXED key
// set (see WIDGET_QUICK_ACTION_ICON_KEYS in
// components/omnichannel/QuickActionsBuilder.tsx) - keep the two in sync.
// `target_queue_id` routes a conversation started from this card to a specific
// conversation queue (null = unrouted); `prefill` seeds the composer text.
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  target_queue_id: string | null;
  prefill: string | null;
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
  // Branding (title + brand_color above already cover the rest).
  bot_name: string;
  bot_avatar_url: string | null;
  // Home screen (the visitor's first view before starting a conversation).
  home_headline: string;
  home_subtext: string;
  show_home_screen: boolean;
  // Quick actions - the option cards the widget renders on the home screen.
  quick_actions: QuickAction[];
  // Presence & response time.
  response_time_label: string;
  show_presence: boolean;
  // Human handoff (escape hatch from an AI/self-serve flow to a live agent).
  enable_human_handoff: boolean;
  handoff_label: string;
  handoff_queue_id: string | null;
  // Privacy footer.
  privacy_footer_text: string | null;
  privacy_url: string | null;
  // AI Answer Bot (Phase 7B) - auto-answers the visitor's first message from
  // the published Knowledge Base before/alongside routing to an agent.
  // These round-trip on the admin GET/PUT config. Note answer_bot_min_confidence
  // is admin-only here; the PUBLIC widget config intentionally omits it.
  answer_bot_enabled: boolean;
  answer_bot_max_articles: number;
  answer_bot_use_llm: boolean;
  answer_bot_min_confidence: number;
  answer_bot_intro_text: string | null;
  answer_bot_no_answer_text: string | null;
  // i18n: admin-configurable widget language. null/undefined = "Automatic"
  // (the widget uses its embed data-locale attribute or its own default);
  // otherwise one of the shipped string-pack locales ("id" | "en").
  default_locale?: string | null;
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
  channel_types: ChannelType[];
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
  channel_type: ChannelType;
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
  channel_type: ChannelType;
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
  channel_types: ChannelType[];
  unread_count: number;
  open_conversation_count: number;
  latest_conversation_id?: string;
  last_message_at?: string;
}

// ---------------------------------------------------------------------------
// Organizations (Support Desk Phase 1/2).
//
// A CRM company view surfaced in the workspace context panel: the company's
// profile plus its aggregate contact/conversation counts. The company's
// conversations are fetched separately and reuse ConversationListItem, so the
// org's other conversations render exactly like the inbox queue rows.
// Base /omnichannels/organizations/{crm_company_id}.
// ---------------------------------------------------------------------------
export interface OrganizationSummary {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  location: string | null;
  contact_count: number;
  conversation_count: number;
  open_conversation_count: number;
}

// ---------------------------------------------------------------------------
// Saved views (Support Desk Phase 1/2).
//
// A named, optionally-shared filter preset for the workspace queue. Distinct
// from the built-in WORKSPACE_VIEWS presets (which are hard-coded client-side):
// these are per-tenant, persisted, and selecting one applies ALL of its
// filters. `is_owner` gates deletion. Base /omnichannels/saved-views.
// ---------------------------------------------------------------------------
export interface SavedViewFilters {
  status?: string;
  priority?: string;
  channel_type?: string;
  assigned_to_me?: boolean;
  unassigned?: boolean;
  q?: string;
}

export interface SavedView {
  id: string;
  name: string;
  resource: string;
  filters: SavedViewFilters;
  is_shared: boolean;
  position: number;
  is_owner: boolean;
}

export interface CreateSavedViewRequest {
  name: string;
  resource?: string;
  filters: SavedViewFilters;
  is_shared?: boolean;
}

export interface UpdateSavedViewRequest {
  name?: string;
  filters?: SavedViewFilters;
  is_shared?: boolean;
  position?: number;
}

// ---------------------------------------------------------------------------
// Reply drafts (Support Desk Phase 1/2).
//
// A single per-conversation, per-agent draft body autosaved from the composer
// and cleared on send. GET returns an empty body when none exists.
// Base /omnichannels/conversations/{conversation_id}/draft.
// ---------------------------------------------------------------------------
export interface ConversationDraft {
  body: string;
}

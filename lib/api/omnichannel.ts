import { fetchWithTimeout } from "./api-client";
import {
  Account,
  ChannelType,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectSmsRequest,
  ConnectMessengerRequest,
  ConnectInstagramRequest,
  ConnectEmailRequest,
  ConnectWebWidgetRequest,
  WebWidgetConfig,
  UpdateWebWidgetConfigRequest,
  UpdateAccountRequest,
  CreateConversationRequest,
  MediaUploadResponse,
  OmnichannelContact,
  OmnichannelContactsResponse,
  OmnichannelContactTimelineResponse,
  OmnichannelContactInboxDetail,
  AssignConversationRequest,
  SetConversationTagsRequest,
  CreateConversationNoteRequest,
  CreateConversationTagRequest,
  ConversationTagsResponse,
  ConversationTag,
  ConversationNote,
  SetConversationStatusRequest,
  SetConversationPriorityRequest,
  SnoozeConversationRequest,
  TransferConversationRequest,
  CannedReply,
  CreateCannedReplyRequest,
  UpdateCannedReplyRequest,
  ConversationViewersResponse,
  ConversationListItem,
  ConversationInboxFilters,
  ConversationInboxResponse,
  OrganizationSummary,
  SavedView,
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  ConversationDraft,
} from "../types/omnichannel";

// Re-export types for convenience
export type {
  Account,
  ChannelType,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectSmsRequest,
  ConnectMessengerRequest,
  ConnectInstagramRequest,
  ConnectEmailRequest,
  ConnectWebWidgetRequest,
  WebWidgetConfig,
  UpdateWebWidgetConfigRequest,
  UpdateAccountRequest,
  CreateConversationRequest,
  MediaUploadResponse,
  OmnichannelContact,
  OmnichannelContactsResponse,
  OmnichannelContactTimelineResponse,
  OmnichannelContactInboxDetail,
  AssignConversationRequest,
  SetConversationTagsRequest,
  CreateConversationNoteRequest,
  CreateConversationTagRequest,
  ConversationTagsResponse,
  ConversationTag,
  ConversationNote,
  SetConversationStatusRequest,
  SetConversationPriorityRequest,
  SnoozeConversationRequest,
  TransferConversationRequest,
  CannedReply,
  CreateCannedReplyRequest,
  UpdateCannedReplyRequest,
  ConversationViewersResponse,
  ConversationListItem,
  ConversationInboxFilters,
  ConversationInboxResponse,
  OrganizationSummary,
  SavedView,
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  ConversationDraft,
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/omnichannels`;
// Conversation tag catalog is its own top-level resource (not nested under
// /omnichannels) - mirrors /ticket-tags' relationship to /tickets, see
// lib/api/ticket-tags.ts.
const TAGS_BASE = `${process.env.NEXT_PUBLIC_API_URL}/omnichannel-conversation-tags`;

// Contact-centric merged timeline - used to disambiguate which conversation
// belongs to the active chatMode tab for a contact with more than one
// channel (e.g. WhatsApp + Email), since `latest_conversation_id` on
// `OmnichannelContact` isn't channel-specific.
export async function fetchContactTimeline(
  token: string,
  contactKey: string,
  channelType?: string
): Promise<OmnichannelContactTimelineResponse> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);

  const res = await fetchWithTimeout(
    `${API_BASE}/inbox/contacts/${encodeURIComponent(contactKey)}/timeline?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch contact timeline');
  }

  return json.data || json;
}

// Account Management
export async function fetchAccounts(token: string, channelType?: string, includeInactive?: boolean): Promise<Account[]> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);
  if (includeInactive) params.append('include_inactive', 'true');

  const res = await fetchWithTimeout(`${API_BASE}/accounts?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch accounts');
  }

  // Handle different response structures
  const data = json.data || json;
  return Array.isArray(data) ? data : [];
}

export async function fetchOmnichannelContacts(
  token: string,
  q?: string,
  channelType?: string,
  activeWithinDays?: number,
  status?: string,
  priority?: string,
  assignedToMe?: boolean
): Promise<OmnichannelContactsResponse> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (channelType) params.append('channel_type', channelType);
  if (activeWithinDays) params.append('active_within_days', String(activeWithinDays));
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (assignedToMe) params.append('assigned_to_me', 'true');

  const res = await fetchWithTimeout(`${API_BASE}/inbox/contacts?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch omnichannel contacts');
  }

  return json.data || json;
}

// Conversation-FIRST queue for the Support Desk agent workspace.
// GET /omnichannels/inbox -> { data: { conversations, total, page, limit } }.
// Unlike fetchOmnichannelContacts (contact-first inbox), this returns one row
// per conversation, unified across every channel. Empty/omitted filter keys
// are dropped rather than sent blank.
export async function fetchConversationInbox(
  token: string,
  filters: ConversationInboxFilters = {}
): Promise<ConversationInboxResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assigned_to_me) params.append('assigned_to_me', 'true');
  if (filters.unassigned) params.append('unassigned', 'true');
  if (filters.channel_type) params.append('channel_type', filters.channel_type);
  if (filters.q) params.append('q', filters.q);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const res = await fetchWithTimeout(`${API_BASE}/inbox?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch conversation inbox');
  }

  return json.data || json;
}

export async function connectWhatsApp(token: string, data: ConnectWhatsAppRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect WhatsApp account');
  }

  return json.data || json;
}

// Phase 9 Inc A: connect an SMS number. Mirrors connectWhatsApp's envelope -
// same Twilio credentials, backend verifies the account before storing.
export async function connectSms(token: string, data: ConnectSmsRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect SMS account');
  }

  return json.data || json;
}

// Phase 9 Inc B: connect a Facebook Page for Messenger. BYOK Page Access
// Token - the backend verifies it against the Graph API before storing it
// encrypted; a page can be actively connected to only ONE company
// platform-wide (webhook tenant routing is purely by page id).
export async function connectMessenger(token: string, data: ConnectMessengerRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/messenger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect Messenger account');
  }

  return json.data || json;
}

// Phase 9 Inc C: connect an Instagram professional account for DMs. Same
// BYOK page token flow as Messenger; the backend resolves the IG business
// account id from page_id when it isn't supplied directly, verifies the
// token against the Graph API, and stores it encrypted. An IG account can
// be actively connected to only ONE company platform-wide (webhook tenant
// routing is purely by the IG business account id).
export async function connectInstagram(token: string, data: ConnectInstagramRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/instagram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect Instagram account');
  }

  return json.data || json;
}

export async function connectEmail(token: string, data: ConnectEmailRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect email account');
  }

  return json.data || json;
}

export async function connectWebWidget(token: string, data: ConnectWebWidgetRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/web-widget`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to connect Web Widget account');
  }

  return json.data || json;
}

export async function fetchWebWidgetConfig(token: string, accountId: string): Promise<WebWidgetConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/${accountId}/web-widget-config`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch Web Widget config');
  }

  return json.data || json;
}

export async function updateWebWidgetConfig(token: string, accountId: string, data: UpdateWebWidgetConfigRequest): Promise<WebWidgetConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/${accountId}/web-widget-config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update Web Widget config');
  }

  return json.data || json;
}

export async function deleteAccount(token: string, accountId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/${accountId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to delete account');
  }
}

export async function updateAccount(token: string, accountId: string, data: UpdateAccountRequest): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/${accountId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update account');
  }

  return json.data || json;
}

export async function reactivateAccount(token: string, accountId: string): Promise<Account> {
  const res = await fetchWithTimeout(`${API_BASE}/accounts/${accountId}/reactivate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to reactivate account');
  }

  return json.data || json;
}

export async function refreshEmail(token: string, fullSync: boolean): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/emails/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ full_sync: fullSync }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to refresh emails');
  }
}

// Inbox
export async function fetchContactInboxDetail(
  token: string,
  contactKey: string
): Promise<OmnichannelContactInboxDetail> {
  const res = await fetchWithTimeout(
    `${API_BASE}/inbox/contacts/${encodeURIComponent(contactKey)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch contact inbox detail');
  }

  return json.data || json;
}

export async function createConversation(token: string, data: CreateConversationRequest): Promise<Conversation> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const errorMessage = typeof json.error === 'string'
      ? json.error
      : (json.error?.message || json.message || 'Failed to create conversation');
    throw new Error(errorMessage);
  }

  return json.data || json;
}

// Conversations
export async function fetchConversation(token: string, conversationId: string): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch conversation');
  }

  return json.data || json;
}

export async function deleteConversation(token: string, conversationId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to delete conversation');
  }
}

export async function createTicketFromConversation(token: string, conversationId: string): Promise<any> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/create-ticket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to create ticket from conversation');
  }

  return json;
}

export async function markAsRead(token: string, conversationId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to mark as read');
  }
}

export async function assignConversation(token: string, conversationId: string, data: AssignConversationRequest): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to assign conversation');
  }

  return json.data || json;
}

export async function setConversationStatus(token: string, conversationId: string, data: SetConversationStatusRequest): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update conversation status');
  }

  return json.data || json;
}

export async function setConversationPriority(token: string, conversationId: string, data: SetConversationPriorityRequest): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/priority`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update conversation priority');
  }

  return json.data || json;
}

// Snooze a conversation until an ISO-8601 UTC datetime (auto-reopen). The
// backend moves it to `snoozed` status, so it drops out of the open queue.
export async function snoozeConversation(token: string, conversationId: string, snoozedUntilISO: string): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/snooze`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ snoozed_until: snoozedUntilISO }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to snooze conversation');
  }

  return json.data || json;
}

// Hand the conversation to another agent, with an optional note.
export async function transferConversation(token: string, conversationId: string, data: TransferConversationRequest): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to transfer conversation');
  }

  return json.data || json;
}

// Conversation collision presence (mirrors the ticket viewers heartbeat/poll
// pair in lib/api/tickets.ts). Both are best-effort - the caller swallows
// errors rather than surfacing a toast.
export async function conversationViewerHeartbeat(token: string, conversationId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/viewers/heartbeat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw new Error('Failed to send conversation viewer heartbeat');
  }
}

export async function getConversationViewers(token: string, conversationId: string): Promise<ConversationViewersResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/viewers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to load conversation viewers');
  }

  return json;
}

// Agent-typing presence: best-effort POST fired (throttled) from the agent
// composer while the agent is typing, so the visitor's channel can surface an
// "agent is typing" indicator. Mirrors the viewer-heartbeat best-effort
// contract - the caller (useAgentTypingSignal) swallows errors.
export async function postConversationTyping(token: string, conversationId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/typing`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw new Error('Failed to send conversation typing signal');
  }
}

export async function setConversationTags(token: string, conversationId: string, data: SetConversationTagsRequest): Promise<ConversationWithMessages> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/tags`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update conversation tags');
  }

  return json.data || json;
}

export async function createConversationNote(token: string, conversationId: string, data: CreateConversationNoteRequest): Promise<ConversationNote> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to add conversation note');
  }

  return json.data || json;
}

// Conversation Tags Catalog (company-wide, not conversation-scoped)
export async function fetchConversationTags(token: string): Promise<ConversationTagsResponse> {
  const res = await fetchWithTimeout(TAGS_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch conversation tags');
  }

  return json.data || json;
}

export async function createConversationTag(token: string, data: CreateConversationTagRequest): Promise<ConversationTag> {
  const res = await fetchWithTimeout(TAGS_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to create conversation tag');
  }

  return json.data || json;
}

export async function deleteConversationTag(token: string, tagId: string): Promise<any> {
  const res = await fetchWithTimeout(`${TAGS_BASE}/${tagId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to delete conversation tag');
  }

  return json.data || json;
}

// Messages
export async function sendMessage(token: string, conversationId: string, content: string): Promise<Message> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to send message');
  }

  return json.data || json;
}

export async function uploadMedia(token: string, conversationId: string, file: File, content?: string): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('files', file);
  if (content) {
    formData.append('content', content);
  }

  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/messages/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to upload media');
  }

  return json.data || json;
}

// Canned Replies (saved replies with an optional "/" shortcut)
export async function fetchCannedReplies(token: string, includeInactive?: boolean): Promise<CannedReply[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append('include_inactive', 'true');

  const res = await fetchWithTimeout(`${API_BASE}/canned-replies?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch canned replies');
  }

  const data = json.data || json;
  return Array.isArray(data) ? data : [];
}

export async function createCannedReply(token: string, data: CreateCannedReplyRequest): Promise<CannedReply> {
  const res = await fetchWithTimeout(`${API_BASE}/canned-replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to create canned reply');
  }

  return json.data || json;
}

export async function updateCannedReply(token: string, id: string, data: UpdateCannedReplyRequest): Promise<CannedReply> {
  const res = await fetchWithTimeout(`${API_BASE}/canned-replies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update canned reply');
  }

  return json.data || json;
}

export async function deleteCannedReply(token: string, id: string): Promise<{ id: string; deleted: boolean }> {
  const res = await fetchWithTimeout(`${API_BASE}/canned-replies/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to delete canned reply');
  }

  return json.data || json;
}

// Organizations (CRM company summary + its conversations) for the workspace
// context panel. The conversations list reuses ConversationListItem so it
// renders exactly like the inbox queue rows.
export async function fetchOrganization(token: string, crmCompanyId: string): Promise<OrganizationSummary> {
  const res = await fetchWithTimeout(`${API_BASE}/organizations/${encodeURIComponent(crmCompanyId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch organization');
  }

  return json.data || json;
}

export async function fetchOrganizationConversations(
  token: string,
  crmCompanyId: string,
  limit = 50
): Promise<ConversationListItem[]> {
  const params = new URLSearchParams();
  params.append('limit', String(limit));

  const res = await fetchWithTimeout(
    `${API_BASE}/organizations/${encodeURIComponent(crmCompanyId)}/conversations?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch organization conversations');
  }

  const data = json.data || json;
  return Array.isArray(data) ? data : [];
}

// Saved views (named, optionally-shared queue filter presets).
export async function fetchSavedViews(token: string, resource = 'conversation'): Promise<SavedView[]> {
  const params = new URLSearchParams();
  params.append('resource', resource);

  const res = await fetchWithTimeout(`${API_BASE}/saved-views?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch saved views');
  }

  const data = json.data || json;
  return Array.isArray(data) ? data : [];
}

export async function createSavedView(token: string, data: CreateSavedViewRequest): Promise<SavedView> {
  const res = await fetchWithTimeout(`${API_BASE}/saved-views`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to create saved view');
  }

  return json.data || json;
}

export async function updateSavedView(token: string, id: string, data: UpdateSavedViewRequest): Promise<SavedView> {
  const res = await fetchWithTimeout(`${API_BASE}/saved-views/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to update saved view');
  }

  return json.data || json;
}

export async function deleteSavedView(token: string, id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/saved-views/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to delete saved view');
  }
}

// Reply drafts (per-conversation, per-agent). GET returns an empty body when
// none exists; PUT upserts; DELETE clears (called on send).
export async function fetchConversationDraft(token: string, conversationId: string): Promise<ConversationDraft> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/draft`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch draft');
  }

  const data = json.data || json;
  return { body: data?.body ?? '' };
}

export async function saveConversationDraft(token: string, conversationId: string, body: string): Promise<ConversationDraft> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/draft`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ body }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to save draft');
  }

  const data = json.data || json;
  return { body: data?.body ?? '' };
}

export async function deleteConversationDraft(token: string, conversationId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/conversations/${conversationId}/draft`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    // DELETE may return 204 with no body; only try to parse an error payload.
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // no body
    }
    throw json || new Error('Failed to delete draft');
  }
}

export interface ConversationSalesReading {
  exists: boolean;
  score?: number;
  base_score?: number;
  stage?: string | null;
  sales_state?: string | null;
  veto?: string | null;
  needs_human?: boolean;
  archetype?: string | null;
  last_signal_at?: string | null;
  signals?: {
    signal_id: string;
    category: string;
    weight: number;
    matched_cue: string;
    detected_at?: string | null;
  }[];
}

export async function fetchConversationSalesReading(
  token: string,
  conversationId: string,
): Promise<ConversationSalesReading> {
  const res = await fetchWithTimeout(
    `${API_BASE}/conversations/${conversationId}/sales-reading`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw json || new Error('Failed to fetch sales reading');
  return json.data || json;
}

import { fetchWithTimeout } from "./api-client";
import {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
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
} from "../types/omnichannel";

// Re-export types for convenience
export type {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
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

export async function fetchOmnichannelContacts(token: string, q?: string): Promise<OmnichannelContactsResponse> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);

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

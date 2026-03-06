import { fetchWithTimeout } from "./api-client";
import {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectEmailRequest,
  CreateConversationRequest,
  MediaUploadResponse,
  OmnichannelContact,
  OmnichannelContactsResponse,
} from "../types/omnichannel";

// Re-export types for convenience
export type {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectEmailRequest,
  CreateConversationRequest,
  MediaUploadResponse,
  OmnichannelContact,
  OmnichannelContactsResponse,
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/omnichannels`;

// Account Management
export async function fetchAccounts(token: string, channelType?: string): Promise<Account[]> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);

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
export async function fetchInbox(token: string, channelType?: string, status?: string): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);
  if (status) params.append('status', status);

  const res = await fetchWithTimeout(`${API_BASE}/inbox?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    throw json || new Error('Failed to fetch inbox');
  }

  // Handle different response structures
  const data = json.data || json;
  // Check if data has a conversations property
  if (data.conversations && Array.isArray(data.conversations)) {
    return data.conversations;
  }
  return Array.isArray(data) ? data : [];
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

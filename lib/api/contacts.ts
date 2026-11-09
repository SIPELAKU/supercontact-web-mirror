// lib/api/contacts.ts
// Contacts API functions

import { fetchWithTimeout } from "./api-client";
import type {
  ContactConversationListResponse,
  ContactConversationQuery,
} from "@/lib/types/omnichannel";
import { readCreateContactResponse, type CreateContactResult } from "@/lib/utils/contactDuplicate";

// ============================================
// Types
// ============================================

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    contacts: Contact[];
  };
  error: string | null;
}

// ============================================
// Functions
// ============================================

export async function fetchContacts(
  token: string,
  params?: { search?: string; page?: number; limit?: number; include_all?: boolean }
): Promise<ContactResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.include_all !== undefined) {
    queryParams.append('include_all', params.include_all.toString());
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Contacts API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) {
    let errorMsg = json.message || json.error?.message || "Failed to load contacts";
    if (json.error?.details && Array.isArray(json.error.details)) {
      const details = json.error.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
      if (details) errorMsg = details;
    }
    throw new Error(errorMsg);
  }
  return json;
}

// POST /contacts. Never throws for an API answer: a duplicate (409) or a
// refusal comes back as a result the form acts on (lib/utils/contactDuplicate).
export async function createContact(
  token: string,
  body: Record<string, unknown>,
): Promise<CreateContactResult> {
  const res = await fetchWithTimeout(`/api/proxy/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return readCreateContactResponse(res.status, json);
}

// Every conversation of one contact (BE-1.2). A contact without conversations
// answers `items: []`, not 404.
export async function fetchContactConversations(
  token: string,
  contactId: string,
  query: ContactConversationQuery,
): Promise<ContactConversationListResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.channel_type) params.set("channel_type", query.channel_type);
  if (query.sort) params.set("sort", query.sort);

  const res = await fetchWithTimeout(
    `/api/proxy/contacts/${encodeURIComponent(contactId)}/conversations?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed to load conversations");
  }
  return json.data;
}

export async function deleteMultipleContacts(token: string, contactIds: string[]): Promise<ContactResponse> {
  const res = await fetchWithTimeout(`/api/proxy/contacts`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ contact_ids: contactIds }),
  });

  const json = await res.json();
  console.log("Delete multiple contacts API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) {
    let errorMsg = json.message || json.error?.message || "Failed to delete multiple contacts";
    if (json.error?.details && Array.isArray(json.error.details)) {
      const details = json.error.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
      if (details) errorMsg = details;
    }
    throw new Error(errorMsg);
  }
  return json;
}

export async function deleteContact(token: string, contactId: string): Promise<any> {
  const res = await fetchWithTimeout(`/api/proxy/contacts/${contactId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id: contactId }),
  });

  const json = await res.json();
  console.log("Delete contact API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) {
    let errorMsg = json.message || json.error?.message || "Failed to delete contact";
    if (json.error?.details && Array.isArray(json.error.details)) {
      const details = json.error.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
      if (details) errorMsg = details;
    }
    throw new Error(errorMsg);
  }
  return json;
}
export async function deleteAllContacts(token: string): Promise<any> {
  const res = await fetchWithTimeout(`/api/proxy/contacts/all`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });

  const json = await res.json();
  console.log("Delete all contacts API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) {
    let errorMsg = json.message || json.error?.message || "Failed to delete all contacts";
    throw new Error(errorMsg);
  }
  return json;
}

export async function duplicateContacts(token: string, contactIds: string[]): Promise<any> {
  const res = await fetchWithTimeout(`/api/proxy/contacts/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ contact_ids: contactIds }),
  });

  const json = await res.json();
  console.log("Duplicate contacts API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) {
    let errorMsg = json.message || json.error?.message || "Failed to duplicate contacts";
    if (json.error?.details && Array.isArray(json.error.details)) {
      const details = json.error.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
      if (details) errorMsg = details;
    }
    throw new Error(errorMsg);
  }
  return json;
}

export async function saveAsContacts(token: string, target: string[], contactIds: string[]): Promise<any> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/contacts/save-as`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target, contact_ids: contactIds }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    let errorMsg = json.message || json.error?.message || "Failed to save contacts as target";
    throw new Error(errorMsg);
  }
  return json;
}


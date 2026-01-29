// lib/api/contacts.ts
// Contacts API functions

import { fetchWithTimeout } from "./api-client";

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

export async function fetchContacts(token: string): Promise<ContactResponse> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Contacts API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load contacts");
  return json;
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

  if (!res.ok || !json.success) throw new Error("Failed to delete multiple contacts");
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

  if (!res.ok || !json.success) throw new Error("Failed to delete contact");
  return json;
}

// lib/api/contacts.ts
// Contacts API functions

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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
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

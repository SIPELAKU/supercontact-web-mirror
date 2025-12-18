// lib/api.ts

import { leadResponse } from "@/lib/models/types";

export async function fetchLeads(token: string): Promise<leadResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("API response:", json);
  
  if (res.status === 401) {
    // Token is invalid/expired, throw specific error
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load leads");
  return json;
}

export interface CreateLeadData {
  // For existing contact
  contact_id?: string;
  
  // For new contact (required if contact_id not provided)
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  
  // Lead specific fields (always required)
  industry: string;
  company_size: string;
  office_location: string;
  lead_status: string;
  lead_source: string;
  assigned_to: string;
  tag: string;
  notes: string;
}

export async function createLead(token: string, leadData: CreateLeadData): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  });

  const json = await res.json();
  console.log("Create lead response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    throw new Error(json.message || "Failed to create lead");
  }
  
  return json;
}

export interface UpdateLeadData {
  contact_id?: string;
  industry: string;
  company_size: string;
  office_location: string;
  lead_status: string;
  lead_source: string;
  assigned_to: string;
  tag: string;
  notes: string;
}

export async function updateLead(token: string, leadId: string, leadData: UpdateLeadData): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  });

  const json = await res.json();
  console.log("Update lead response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    throw new Error(json.message || "Failed to update lead");
  }
  
  return json;
}

export async function deleteLead(token: string, leadId: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`, {
    method: 'DELETE',
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  console.log("Delete lead response status:", res.status);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to delete lead");
  }
  
  return { success: true };
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

export interface UserResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    users: User[];
  };
  error: string | null;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function fetchUsers(token: string): Promise<UserResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Users API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load users");
  return json;
}

// lib/api/leads.ts
// Leads API functions: CRUD operations for leads

import { leadResponse } from "@/lib/models/types";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

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

// ============================================
// Functions
// ============================================

export async function fetchLeads(token: string, page: number = 1, limit: number = 10): Promise<leadResponse> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/leads`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("API response:", json);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || !json.success) throw new Error("Failed to load leads");
  return json;
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

export async function updateLead(token: string, leadId: string, leadData: UpdateLeadData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`;

  logger.info("Making PUT request to update lead", {
    url,
    leadId,
    leadData,
    hasToken: !!token
  });

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(leadData),
  });

  let json;
  try {
    json = await res.json();
  } catch (parseError: any) {
    logger.error("Failed to parse response JSON", {
      status: res.status,
      statusText: res.statusText,
      parseError: parseError.message
    });
    throw new Error(`Server returned invalid response (${res.status})`);
  }

  logger.apiResponse(`/leads/${leadId} (PUT)`, { status: res.status, response: json });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    logger.error(`Update lead failed: ${res.status}`, {
      status: res.status,
      statusText: res.statusText,
      response: json,
      leadData,
      url
    });
    throw new Error(json.message || json.error || `Failed to update lead (${res.status}: ${res.statusText})`);
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

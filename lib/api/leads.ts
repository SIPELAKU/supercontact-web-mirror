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
  phone_number?: string;
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
  name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
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
// Helper
// ============================================

async function handleResponse(res: Response, errorMessage: string) {
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    logger.error(`Failed to parse JSON for ${res.url}`, { status: res.status });
    throw new Error(`${errorMessage} (Invalid JSON response)`);
  }

  if (!res.ok || (json.success === false)) {
    const errorMsg = json.message || json.error?.message || json.error || errorMessage;
    logger.error(`API Error: ${res.url}`, { status: res.status, json });
    throw new Error(errorMsg);
  }

  return json;
}

function getFullUrl(path: string): URL {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  // Handle potential relative path if needed
  if (baseUrl.startsWith('http')) {
    return new URL(`${baseUrl}${path}`);
  } else {
    // Fallback to origin if path is relative
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return new URL(`${origin}${baseUrl}${path}`);
  }
}

// ============================================
// Functions
// ============================================

export async function fetchLeads(token: string, page: number = 1, limit: number = 10): Promise<leadResponse> {
  try {
    const url = getFullUrl("/leads");
    url.searchParams.append("page", String(page));
    url.searchParams.append("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return await handleResponse(res, "Failed to load leads");
  } catch (error: any) {
    logger.error("fetchLeads error:", error);
    throw error;
  }
}

export async function createLead(token: string, leadData: CreateLeadData): Promise<any> {
  try {
    const url = getFullUrl("/leads");
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    return await handleResponse(res, "Failed to create lead");
  } catch (error: any) {
    logger.error("createLead error:", error);
    throw error;
  }
}

export async function updateLead(token: string, leadId: string, leadData: UpdateLeadData): Promise<any> {
  try {
    const url = getFullUrl(`/leads/${leadId}`);
    const res = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    return await handleResponse(res, "Failed to update lead");
  } catch (error: any) {
    logger.error("updateLead error:", error);
    throw error;
  }
}

export async function deleteLead(token: string, leadId: string): Promise<any> {
  try {
    const url = getFullUrl(`/leads/${leadId}`);
    const res = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await handleResponse(res, "Failed to delete lead");
  } catch (error: any) {
    logger.error("deleteLead error:", error);
    throw error;
  }
}

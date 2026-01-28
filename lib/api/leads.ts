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

/**
 * Shared response handler to ensure consistent error parsing and authorization checks.
 */
async function handleResponse(res: Response, errorMessage: string) {
  if (res.status === 401) {
    console.error("API Error: Unauthorized (401)");
    throw new Error("UNAUTHORIZED");
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    console.error(`Failed to parse JSON for ${res.url}`, { status: res.status });
    logger.error(`Failed to parse JSON for ${res.url}`, { status: res.status });
    throw new Error(`${errorMessage} (Invalid JSON response)`);
  }

  if (!res.ok || (json.success === false)) {
    const errorMsg = json.message || json.error?.message || json.error || errorMessage;
    console.error(`API Error: ${res.url}`, { status: res.status, message: errorMsg, json });
    logger.error(`API Error: ${res.url}`, { status: res.status, json });
    throw new Error(errorMsg);
  }

  return json;
}

/**
 * Constructs a full URL using the environment's base API URL.
 */
function getFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_URL is missing!");
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  // Basic concatenation - assumes baseUrl doesn't end with slash if path starts with one
  return `${baseUrl}${path}`;
}

// ============================================
// Functions
// ============================================

/**
 * Fetch a paginated list of leads.
 */
export async function fetchLeads(token: string, page: number = 1, limit: number = 10): Promise<leadResponse> {
  console.log('[fetchLeads] Starting...', { page, limit });
  try {
    const baseUrl = getFullUrl("/leads");
    console.log('baseUrl', baseUrl);

    // Build query parameters - works for both absolute and relative URLs
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    const url = `${baseUrl}?${queryParams.toString()}`;

    console.log('[fetchLeads] URL:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

    console.log('[fetchLeads] Response status:', res.status);
    return await handleResponse(res, "Failed to load leads");
  } catch (error: any) {
    console.error("[fetchLeads] Error catch:", error.message);
    logger.error("fetchLeads error:", error);
    throw error;
  }
}

/**
 * Create a new lead.
 */
export async function createLead(token: string, leadData: CreateLeadData): Promise<any> {
  console.log('[createLead] Starting...', leadData);
  try {
    const url = getFullUrl("/leads");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    console.log('[createLead] Response status:', res.status);
    return await handleResponse(res, "Failed to create lead");
  } catch (error: any) {
    console.error("[createLead] Error catch:", error.message);
    logger.error("createLead error:", error);
    throw error;
  }
}

/**
 * Update an existing lead.
 */
export async function updateLead(token: string, leadId: string, leadData: UpdateLeadData): Promise<any> {
  console.log('[updateLead] Starting...', { leadId, leadData });
  try {
    const url = getFullUrl(`/leads/${leadId}`);

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    console.log('[updateLead] Response status:', res.status);
    return await handleResponse(res, "Failed to update lead");
  } catch (error: any) {
    console.error("[updateLead] Error catch:", error.message);
    logger.error("updateLead error:", error);
    throw error;
  }
}

/**
 * Delete a lead by ID.
 */
export async function deleteLead(token: string, leadId: string): Promise<any> {
  console.log('[deleteLead] Starting...', { leadId });
  try {
    const url = getFullUrl(`/leads/${leadId}`);

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept": "application/json"
      },
    });

    console.log('[deleteLead] Response status:', res.status);
    return await handleResponse(res, "Failed to delete lead");
  } catch (error: any) {
    console.error("[deleteLead] Error catch:", error.message);
    logger.error("deleteLead error:", error);
    throw error;
  }
}

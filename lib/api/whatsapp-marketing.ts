// lib/api/whatsapp-marketing.ts
// WhatsApp Marketing API functions

import type {
  BroadcastsResponse,
  BroadcastCampaign,
} from '../types/whatsapp-marketing';
import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

// ============================================
// Functions
// ============================================

/**
 * Fetch all WhatsApp broadcasts
 */
export async function fetchBroadcasts(
  token: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
): Promise<BroadcastsResponse> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    queryParams.append('search', search);
  }
  
  if (status) {
    queryParams.append('status', status);
  }
  
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts?${queryParams.toString()}`;

  logger.info("Making GET request to fetch broadcasts", { url, page, limit, search, status });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse broadcasts response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/broadcasts (GET)", { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Fetch broadcasts failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch broadcasts (${res.status}: ${res.statusText})`);
    }

    return json;
  } catch (error: any) {
    logger.error("Fetch broadcasts request failed", { error: error.message, url });
    throw error;
  }
}

/**
 * Create a new WhatsApp broadcast
 */
export async function createBroadcast(
  token: string, 
  data: import('../types/whatsapp-marketing').CreateBroadcastData
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts`;

  logger.info("Making POST request to create broadcast", { url, data });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse create broadcast response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/broadcasts (POST)", { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Create broadcast failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      
      const errorMsg = json.error?.message || `Failed to create broadcast (${res.status}: ${res.statusText})`;
      const error = new Error(errorMsg) as any;
      error.data = json; // Keep data for parsing details like validation errors
      throw error;
    }

    return json;
  } catch (error: any) {
    logger.error("Create broadcast request failed", { error: error.message, url });
    throw error;
  }
}

/**
 * Update an existing WhatsApp broadcast (Placeholder)
 */
export async function updateBroadcast(token: string, id: string, data: any): Promise<any> {
  logger.info("Executing placeholder for updateBroadcast", { id, data });
  // Mocking behavior for now until API is ready
  return { success: true, data: { ...data, id } };
}

/**
 * Delete a WhatsApp broadcast (Placeholder)
 */
export async function deleteBroadcast(token: string, id: string): Promise<any> {
  logger.info("Executing placeholder for deleteBroadcast", { id });
  // Mocking behavior for now until API is ready
  return { success: true, data: { id, deleted: true } };
}

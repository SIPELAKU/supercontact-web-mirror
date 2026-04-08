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
 * Update an existing WhatsApp broadcast
 */
export async function updateBroadcast(
  token: string,
  id: string,
  data: import('../types/whatsapp-marketing').UpdateBroadcastData
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/${id}`;

  logger.info("Making PUT request to update broadcast", { url, id, data });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'PUT',
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
      logger.error("Failed to parse update broadcast response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/broadcasts/${id} (PUT)`, { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Update broadcast failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });

      const errorMsg = json.error?.message || `Failed to update broadcast (${res.status}: ${res.statusText})`;
      const error = new Error(errorMsg) as any;
      error.data = json;
      throw error;
    }

    return json;
  } catch (error: any) {
    logger.error("Update broadcast request failed", { error: error.message, url });
    throw error;
  }
}

/**
 * Delete a WhatsApp broadcast
 */
export async function deleteBroadcast(token: string, id: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/${id}`;

  logger.info("Making DELETE request for broadcast", { url, id });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      // DELETE might return empty body or simple text
      if (res.status !== 204) {
        logger.warn("Failed to parse delete broadcast response JSON", {
          status: res.status,
          statusText: res.statusText,
          parseError: parseError.message
        });
      }
    }

    logger.apiResponse(`/broadcasts/${id} (DELETE)`, { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Delete broadcast failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json?.error?.message || `Failed to delete broadcast (${res.status}: ${res.statusText})`);
    }

    return json || { success: true };
  } catch (error: any) {
    logger.error("Delete broadcast request failed", { error: error.message, url });
    throw error;
  }
}

/**
 * Fetch recipients for a specific broadcast with their status
 */
export async function fetchBroadcastRecipients(
  token: string,
  id: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<import('../types/whatsapp-marketing').BroadcastRecipientsResponse> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append('search', search);
  }
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/${id}/recipients?${queryParams.toString()}`;

  logger.info("Making GET request to fetch broadcast recipients (v1)", { url, id, page, limit });

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
      logger.error("Failed to parse broadcast recipients response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/broadcasts/${id}/recipients (GET)`, { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Fetch broadcast recipients failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch broadcast recipients (${res.status}: ${res.statusText})`);
    }

    return json;
  } catch (error: any) {
    logger.error("Fetch broadcast recipients request failed", { error: error.message, url });
    throw error;
  }
}

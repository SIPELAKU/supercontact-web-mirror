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
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
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

  if (sortBy) {
    queryParams.append('sort_by', sortBy);
    queryParams.append('sort_order', sortOrder ?? 'asc');
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
 * Duplicate existing WhatsApp broadcasts
 */
export async function duplicateBroadcast(
  token: string,
  broadcastIds: string[]
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/duplicate`;

  logger.info("Making POST request to duplicate broadcasts", { url, broadcastIds });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ broadcast_ids: broadcastIds }),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      if (res.status === 201) return { success: true };
      logger.error("Failed to parse duplicate broadcasts response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/broadcasts/duplicate (POST)", { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Duplicate broadcasts failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });

      const errorMsg = json.error?.message || `Failed to duplicate broadcasts (${res.status}: ${res.statusText})`;
      const error = new Error(errorMsg) as any;
      error.data = json;
      throw error;
    }

    return json;
  } catch (error: any) {
    logger.error("Duplicate broadcasts request failed", { error: error.message, url });
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
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<import('../types/whatsapp-marketing').BroadcastRecipientsResponse> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    // The recipients table paginates server-side; send this explicitly so a
    // change in the BE default can never return the whole list at once.
    is_limit: 'true',
  });

  if (search) {
    queryParams.append('search', search);
  }

  if (status) {
    queryParams.append('status', status);
  }

  // Same sort_by/sort_order contract as the broadcasts list. Without a sort
  // the API keeps its own order (newest contact first).
  if (sortBy) {
    queryParams.append('sort_by', sortBy);
    queryParams.append('sort_order', sortOrder ?? 'asc');
  }

  return requestBroadcastRecipients(token, id, queryParams);
}

/**
 * Every recipient of a broadcast with the given status, in one response - for
 * the CSV export on the stats cards. `is_limit=false` is the API's export
 * switch: it ignores `page` and `limit` and returns the whole list.
 */
export async function fetchAllBroadcastRecipients(
  token: string,
  id: string,
  status: string
): Promise<import('../types/whatsapp-marketing').BroadcastRecipient[]> {
  const queryParams = new URLSearchParams({ status, is_limit: 'false' });
  // A whole list can take longer to build than one page.
  const json = await requestBroadcastRecipients(token, id, queryParams, 120_000);
  return json.data?.recipients ?? [];
}

async function requestBroadcastRecipients(
  token: string,
  id: string,
  queryParams: URLSearchParams,
  timeout?: number
): Promise<import('../types/whatsapp-marketing').BroadcastRecipientsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/${id}/recipients?${queryParams.toString()}`;

  logger.info("Making GET request to fetch broadcast recipients (v1)", { url, id });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout,
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

/**
 * Fetch detail for a specific broadcast
 */
export async function fetchBroadcastDetail(
  token: string,
  id: string
): Promise<{ success: boolean; data: BroadcastCampaign; error?: any }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcasts/${id}`;

  logger.info("Making GET request to fetch broadcast detail", { url, id });

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
      logger.error("Failed to parse broadcast detail response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/broadcasts/${id} (GET)`, { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Fetch broadcast detail failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch broadcast detail (${res.status}: ${res.statusText})`);
    }

    return json;
  } catch (error: any) {
    logger.error("Fetch broadcast detail request failed", { error: error.message, url });
    throw error;
  }
}

/**
 * Save recipients as other targets
 */
export async function saveAsRecipients(
  token: string,
  target: string[],
  recipientIds: string[]
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/recipients/save-as`;

  logger.info("Making POST request to save recipients as target", { url, target, recipientIds });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ target, recipient_ids: recipientIds }),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse save as recipients response JSON", {
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/recipients/save-as (POST)", { status: res.status, response: json });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      logger.error(`Save as recipients failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to save as recipients (${res.status}: ${res.statusText})`);
    }

    return json;
  } catch (error: any) {
    logger.error("Save as recipients request failed", { error: error.message, url });
    throw error;
  }
}


/**
 * Upload a file for use in a template's media slot, returning its public URL.
 *
 * The media editors used to accept only a pasted URL, which meant the tenant
 * had to host the file somewhere public first. The URL must STAY reachable:
 * Twilio fetches it when the template is approved and again on every send, so
 * an expiring link passes review and then fails quietly weeks later.
 */
export async function uploadTemplateMedia(
  token: string,
  file: File
): Promise<{ url: string; name: string; content_type: string; size_bytes: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${baseUrl}/broadcast-templates/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // No Content-Type: the browser sets it with the multipart boundary.
    },
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    // The API reports whichever ceiling actually bites - WhatsApp's or our
    // storage's - so pass its message through rather than inventing one.
    throw new Error(
      json?.error?.message || json?.message || 'Gagal mengunggah berkas'
    );
  }
  return json?.data ?? json;
}

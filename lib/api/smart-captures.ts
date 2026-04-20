// lib/api/smart-captures.ts
// Smart Capture API functions: CRUD operations for lead magnets

import { SmartCaptureResponse, SmartCaptureSubmissionsResponse } from "@/lib/models/types";
import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

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
    let errorMsg = json.message || json.error?.message || json.error || errorMessage;

    // If there are validation details, use them for a more specific error message
    if (json.error?.details && Array.isArray(json.error.details)) {
      const details = json.error.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
      if (details) errorMsg = details;
    }

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

  return `${baseUrl}${path}`;
}

// ============================================
// Functions
// ============================================

/**
 * Fetch a paginated list of smart captures.
 */
export async function fetchSmartCaptures(
  token: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string | string[];
    target?: string;
  } = {}
): Promise<SmartCaptureResponse> {
  const { page = 1, limit = 10, search, status, target } = params;

  try {
    const baseUrl = getFullUrl("/smart-captures");

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (search) queryParams.append('search', search);
    if (status) {
      if (Array.isArray(status)) {
        status.forEach(s => queryParams.append('status', s));
      } else {
        queryParams.append('status', status);
      }
    }
    if (target) queryParams.append('target', target);

    const url = `${baseUrl}?${queryParams.toString()}`;

    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

    return await handleResponse(res, "Failed to load smart captures");
  } catch (error: any) {
    logger.error("fetchSmartCaptures error:", error);
    throw error;
  }
}

/**
 * Fetch a single smart capture by ID.
 */
export async function fetchSmartCaptureById(
  token: string,
  id: string
): Promise<any> {
  try {
    const url = getFullUrl(`/smart-captures/${id}`);

    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

    return await handleResponse(res, "Failed to load smart capture detail");
  } catch (error: any) {
    logger.error("fetchSmartCaptureById error:", error);
    throw error;
  }
}

/**
 * Create a new smart capture (draft or publish).
 */
export async function createSmartCapture(
  token: string,
  data: any
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures");

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await handleResponse(res, "Failed to create smart capture");
  } catch (error: any) {
    logger.error("createSmartCapture error:", error);
    throw error;
  }
}
/**
 * Update an existing smart capture.
 */
export async function updateSmartCapture(
  token: string,
  id: string,
  data: any
): Promise<any> {
  try {
    const url = getFullUrl(`/smart-captures/${id}`);

    const res = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await handleResponse(res, "Failed to update smart capture");
  } catch (error: any) {
    logger.error("updateSmartCapture error:", error);
    throw error;
  }
}

/**
 * Upload files for smart capture.
 */
export async function uploadSmartCaptureFiles(
  token: string,
  files: File[]
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures/files");

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    return await handleResponse(res, "Failed to upload files");
  } catch (error: any) {
    logger.error("uploadSmartCaptureFiles error:", error);
    throw error;
  }
}

/**
 * Delete smart capture files.
 */
export async function deleteSmartCaptureFiles(
  token: string,
  fileIds: string[]
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures/files");

    const res = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ file_ids: fileIds })
    });

    return await handleResponse(res, "Failed to delete files");
  } catch (error: any) {
    logger.error("deleteSmartCaptureFiles error:", error);
    throw error;
  }
}

/**
 * Fetch public smart capture form configuration by code.
 * This is a public endpoint (no auth required).
 */
export async function fetchPublicSmartCaptureForm(
  code: string
): Promise<any> {
  try {
    const url = getFullUrl(`/smart-captures/form/${code}`);

    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    });

    return await handleResponse(res, "Failed to load public form");
  } catch (error: any) {
    logger.error("fetchPublicSmartCaptureForm error:", error);
    throw error;
  }
}

/**
 * Submit public smart capture form data.
 * This is a public endpoint (no auth required).
 */
export async function submitPublicSmartCaptureForm(
  code: string,
  data: any
): Promise<any> {
  try {
    const url = getFullUrl(`/smart-captures/form/${code}`);

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await handleResponse(res, "Failed to submit form");
  } catch (error: any) {
    logger.error("submitPublicSmartCaptureForm error:", error);
    throw error;
  }
}
/**
 * Fetch submissions (leads) for a specific smart capture.
 */
export async function fetchSmartCaptureSubmissions(
  token: string,
  id: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<SmartCaptureSubmissionsResponse> {
  const { page = 1, limit = 10, search } = params;

  try {
    const baseUrl = getFullUrl(`/smart-captures/${id}/submissions`);

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (search) queryParams.append('search', search);

    const url = `${baseUrl}?${queryParams.toString()}`;

    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

    return await handleResponse(res, "Failed to load submissions");
  } catch (error: any) {
    logger.error("fetchSmartCaptureSubmissions error:", error);
    throw error;
  }
}
/**
 * Save submissions as contacts/subscribers/recipients.
 */
export async function saveAsSubmissions(
  token: string,
  smartCaptureId: string,
  target: string[],
  submissionIds: string[]
): Promise<any> {
  try {
    const url = getFullUrl(`/smart-captures/${smartCaptureId}/submissions/save-as`);

    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ target, submission_ids: submissionIds }),
    });

    return await handleResponse(res, "Failed to save submissions");
  } catch (error: any) {
    logger.error("saveAsSubmissions error:", error);
    throw error;
  }
}

/**
 * Update smart capture status using the specialized bulk endpoint.
 */
export async function updateSmartCaptureStatus(
  token: string,
  smartCaptureIds: string[],
  status: string
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures/status");

    const res = await fetchWithTimeout(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ smart_capture_ids: smartCaptureIds, status }),
    });

    return await handleResponse(res, "Failed to update status");
  } catch (error: any) {
    logger.error("updateSmartCaptureStatus error:", error);
    throw error;
  }
}

/**
 * Delete multiple smart captures at once.
 */
export async function deleteMultipleSmartCaptures(
  token: string,
  smartCaptureIds: string[]
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures");

    const res = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ smart_capture_ids: smartCaptureIds }),
    });

    return await handleResponse(res, "Failed to delete smart captures");
  } catch (error: any) {
    logger.error("deleteMultipleSmartCaptures error:", error);
    throw error;
  }
}

/**
 * Duplicate multiple smart captures.
 */
export async function duplicateSmartCaptures(
  token: string,
  smartCaptureIds: string[]
): Promise<any> {
  try {
    const url = getFullUrl("/smart-captures/duplicates");

    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ smart_capture_ids: smartCaptureIds }),
    });

    return await handleResponse(res, "Failed to duplicate smart captures");
  } catch (error: any) {
    logger.error("duplicateSmartCaptures error:", error);
    throw error;
  }
}

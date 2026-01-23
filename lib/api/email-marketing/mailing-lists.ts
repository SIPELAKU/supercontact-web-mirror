// lib/api/email-marketing/mailing-lists.ts
// Mailing Lists API functions

import type {
    CreateMailingListData,
    MailingListDetailResponse,
    MailingListsResponse,
    UpdateMailingListData
} from '../../types/email-marketing';
import { logger } from "../../utils/logger";

// ============================================
// Functions
// ============================================

export async function fetchMailingLists(token: string, page: number = 1, limit: number = 10): Promise<MailingListsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists?page=${page}&limit=${limit}`;
  
  logger.info("Making GET request to fetch mailing lists", { url, page, limit });

  try {
    const res = await fetch(url, {
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
      logger.error("Failed to parse mailing lists response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/mailing-lists (GET)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Fetch mailing lists failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch mailing lists (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch mailing lists request failed", { error: error.message, url });
    throw error;
  }
}

export async function fetchMailingListDetail(token: string, mailingListId: string): Promise<MailingListDetailResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists/${mailingListId}`;
  
  logger.info("Making GET request to fetch mailing list detail", { url, mailingListId });

  try {
    const res = await fetch(url, {
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
      logger.error("Failed to parse mailing list detail response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/mailing-lists/${mailingListId} (GET)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Fetch mailing list detail failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch mailing list detail (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch mailing list detail request failed", { error: error.message, url });
    throw error;
  }
}

export async function createMailingList(token: string, data: CreateMailingListData): Promise<MailingListsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists`;
  
  logger.info("Making POST request to create mailing list", { url, data });

  try {
    const res = await fetch(url, {
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
      logger.error("Failed to parse create mailing list response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/mailing-lists (POST)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Create mailing list failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to create mailing list (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Create mailing list request failed", { error: error.message, url });
    throw error;
  }
}

export async function updateMailingList(token: string, mailingListId: string, data: UpdateMailingListData): Promise<MailingListsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists/${mailingListId}`;
  
  logger.info("Making PUT request to update mailing list", { url, mailingListId, data });

  try {
    const res = await fetch(url, {
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
      logger.error("Failed to parse update mailing list response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/mailing-lists/${mailingListId} (PUT)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Update mailing list failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to update mailing list (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Update mailing list request failed", { error: error.message, url });
    throw error;
  }
}

export async function deleteMailingList(token: string, mailingListId: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists/${mailingListId}`;
  
  logger.info("Making DELETE request to delete mailing list", { url, mailingListId });

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse delete mailing list response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/mailing-lists/${mailingListId} (DELETE)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Delete mailing list failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to delete mailing list (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Delete mailing list request failed", { error: error.message, url });
    throw error;
  }
}

export async function deleteMailingListSubscriber(token: string, mailingListId: string, subscriberId: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/mailing-lists/${mailingListId}/subscribers/${subscriberId}`;
  
  logger.info("Making DELETE request to delete subscriber from mailing list", { url, mailingListId, subscriberId });

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse delete subscriber response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/mailing-lists/${mailingListId}/subscribers/${subscriberId} (DELETE)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Delete subscriber failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to delete subscriber (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Delete subscriber request failed", { error: error.message, url });
    throw error;
  }
}

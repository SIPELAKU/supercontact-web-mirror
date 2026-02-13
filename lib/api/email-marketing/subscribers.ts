// lib/api/email-marketing/subscribers.ts
// Subscribers API functions

import type {
    CreateSubscriberData,
    CreateSubscriberResponse,
    DeleteSubscriberResponse,
    SubscribersResponse
} from '../../types/email-marketing';
import { logger } from "../../utils/logger";
import { fetchWithTimeout } from "../api-client";

// ============================================
// Types
// ============================================

export interface UpdateSubscriberData {
  name: string;
  email: string;
  phone_number: string;
  position: string;
  company: string;
  address: string;
}

// ============================================
// Functions
// ============================================

export async function fetchSubscribers(token: string, page: number = 1, limit: number = 10): Promise<SubscribersResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers?page=${page}&limit=${limit}`;
  
  logger.info("Making GET request to fetch subscribers", { url, page, limit });

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
      logger.error("Failed to parse subscribers response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/subscribers (GET)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Fetch subscribers failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch subscribers (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch subscribers request failed", { error: error.message, url });
    throw error;
  }
}

export async function createSubscriber(token: string, data: CreateSubscriberData): Promise<CreateSubscriberResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers`;
  
  logger.info("Making POST request to create subscriber", { url, data });

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
      logger.error("Failed to parse create subscriber response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/subscribers (POST)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Create subscriber failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to create subscriber (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Create subscriber request failed", { error: error.message, url });
    throw error;
  }
}

export async function deleteSubscriber(token: string, subscriberId: string): Promise<DeleteSubscriberResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers/${subscriberId}`;
  
  logger.info("Making DELETE request to delete subscriber", { url, subscriberId });

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
      logger.error("Failed to parse delete subscriber response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/subscribers/${subscriberId} (DELETE)`, { status: res.status, response: json });
    
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

export async function updateSubscriber(token: string, subscriberId: string, data: UpdateSubscriberData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers/${subscriberId}`;
  
  logger.info("Making PUT request to update subscriber", { url, subscriberId, data });

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
      logger.error("Failed to parse update subscriber response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/subscribers/${subscriberId} (PUT)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Update subscriber failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to update subscriber (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Update subscriber request failed", { error: error.message, url });
    throw error;
  }
}

// lib/api/email-marketing/campaigns.ts
// Campaigns API functions

import type {
    CampaignDetailResponse,
    CampaignsResponse,
    CreateCampaignData,
    UpdateCampaignData
} from '../../types/email-marketing';
import { logger } from "../../utils/logger";
import { fetchWithTimeout } from "../api-client";

// ============================================
// Functions
// ============================================

export async function fetchCampaigns(token: string): Promise<CampaignsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns`;
  
  logger.info("Making GET request to fetch campaigns", { url });

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
      logger.error("Failed to parse campaigns response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/campaigns (GET)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Fetch campaigns failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch campaigns (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch campaigns request failed", { error: error.message, url });
    throw error;
  }
}

export async function fetchCampaignDetail(token: string, campaignId: string): Promise<CampaignDetailResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}`;
  
  logger.info("Making GET request to fetch campaign detail", { url, campaignId });

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
      logger.error("Failed to parse campaign detail response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/campaigns/${campaignId} (GET)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Fetch campaign detail failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to fetch campaign detail (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch campaign detail request failed", { error: error.message, url });
    throw error;
  }
}

export async function createCampaign(token: string, data: CreateCampaignData): Promise<CampaignsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns`;
  
  logger.info("Making POST request to create campaign", { url, data });

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
      logger.error("Failed to parse create campaign response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/campaigns (POST)", { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Create campaign failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to create campaign (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Create campaign request failed", { error: error.message, url });
    throw error;
  }
}

export async function updateCampaign(token: string, campaignId: string, data: UpdateCampaignData): Promise<CampaignsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}`;
  
  logger.info("Making PUT request to update campaign", { url, campaignId, data });

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
      logger.error("Failed to parse update campaign response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/campaigns/${campaignId} (PUT)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Update campaign failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to update campaign (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Update campaign request failed", { error: error.message, url });
    throw error;
  }
}

export async function deleteCampaign(token: string, campaignId: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}`;
  
  logger.info("Making DELETE request to delete campaign", { url, campaignId });

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
      logger.error("Failed to parse delete campaign response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse(`/campaigns/${campaignId} (DELETE)`, { status: res.status, response: json });
    
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      logger.error(`Delete campaign failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.error?.message || `Failed to delete campaign (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Delete campaign request failed", { error: error.message, url });
    throw error;
  }
}

// lib/api/users.ts
// Users and Profile API functions

import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

// ============================================
// Types
// ============================================

export interface User {
  email: string;
  employee_code: string;
  fullname: string;
  id: string;
  position: string;
  status: string;
}
export interface UserResponse {
  success: boolean;
  data: {
    manage_users:User[];
    total: number;
    page: number;
    limit: number;
  };
  error: string | null;
}

export interface ProfileData {
  id: string;
  fullname: string;
  email: string;
  avatar_initial: string;
  role: string | null;
  joined_date: string;
  company: string;
  country: string;
  language: string;
  phone: string;
  skype: string;
  bio: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  error: string | null;
}

export interface UpdateProfileData {
  fullname: string;
  email: string;
  company: string;
  country: string;
  language: string;
  phone: string;
  skype: string;
  bio: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// ============================================
// Functions
// ============================================

export async function fetchUsers(
  token: string, 
  page: number, 
  limit: number,
  search?: string,
  position?: string,
  status?: string
): Promise<UserResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (position) params.append("position", position);
  if (status) params.append("status", status);

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/manage-users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Users API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) throw new Error("Failed to load users");
  
  // API already returns the correct structure, just return it
  return json;
}

export async function fetchProfile(token: string): Promise<ProfileResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/profile`;
  
  logger.info("Making GET request to fetch profile", { url });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { 
        Authorization: `Bearer ${token}`
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse profile response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/user-profile/profile (GET)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Fetch profile failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to fetch profile (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch profile request failed", { error: error.message, url });
    throw error;
  }
}

export async function updateProfile(token: string, profileData: UpdateProfileData): Promise<UpdateProfileResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/profile`;
  
  logger.info("Making PATCH request to update profile", { 
    url, 
    profileData
  });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse profile update response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/user-profile/profile (PATCH)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Profile update failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Profile update failed (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Profile update request failed", { error: error.message, url });
    throw error;
  }
}

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
    users: User[];
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
  avatar?: string;
  avatar_url?: string;
  role: string | null;
  joined_date: string;
  company: string;
  subscription_status: string;
  country: string;
  language: string;
  phone?: string;
  skype?: string;
  bio: string;
  address?: string;
  currency?: string;
  state?: string;
  timezone?: string;
  zip_code?: string;
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
  bio: string;
  address: string;
  currency: string;
  state: string;
  timezone: string;
  zip_code: string;
  phone?: string;
  skype?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface DeviceSession {
  id: string;
  browser: string;
  device: string;
  location: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Functions
// ============================================

export async function fetchUsers(
  token: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  position?: string,
  status?: string
): Promise<UserResponse> {
  const params = new URLSearchParams({
    page: (page || 1).toString(),
    limit: (limit || 10).toString(),
  });
  if (search) params.append("search", search);
  if (position) params.append("position", position);
  if (status) params.append("status", status);

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`, {
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

// Basic in-memory cache for the profile fetch to prevent multiple hits
let profilePromiseCache: Promise<ProfileResponse> | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 2000; // 2 seconds

export async function fetchProfile(token: string): Promise<ProfileResponse> {
  const now = Date.now();
  if (profilePromiseCache && (now - lastCacheTime < CACHE_TTL)) {
    logger.info("Using cached profile fetch promise");
    return profilePromiseCache;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/profile`;
  logger.info("Making GET request to fetch profile", { url });

  profilePromiseCache = (async () => {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
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
        throw new Error(json.message || json.error?.message || `Failed to fetch profile (${res.status})`);
      }

      // Handle different API response structures
      const data = {
        success: json.success !== undefined ? json.success : true,
        data: json.data !== undefined ? json.data : json,
        error: json.error || null
      };

      return data;
    } catch (error: any) {
      // Clear cache on error so next retry can go through
      profilePromiseCache = null;
      throw error;
    }
  })();

  lastCacheTime = now;
  return profilePromiseCache;
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
        'Accept': 'application/json',
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
      const error: any = new Error(json.message || json.error?.message || `Profile update failed (${res.status})`);
      error.data = json; // Attach full response for handleError to see details
      throw error;
    }

    return {
      success: json.success !== undefined ? json.success : true,
      message: json.message || "Profile updated successfully",
      data: json.data !== undefined ? json.data : json
    };
  } catch (error: any) {
    logger.error("Profile update request failed", { error: error.message, url });
    throw error;
  }
}

export async function uploadAvatar(token: string, file: File): Promise<{ success: boolean; data?: any; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/avatar`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData,
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      const error: any = new Error(json.message || json.error?.message || `Avatar upload failed (${res.status})`);
      error.data = json;
      throw error;
    }

    return {
      success: json.success !== undefined ? json.success : true,
      message: json.message || "Avatar uploaded successfully",
      data: json.data !== undefined ? json.data : json
    };
  } catch (error: any) {
    logger.error("Avatar upload request failed", { error: error.message, url });
    throw error;
  }
}

export async function deactivateAccount(token: string): Promise<{ success: boolean; message: string }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/deactivate`;
  logger.info("Making DELETE request to deactivate account", { url });

  try {
    const res = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(json.message || `Account deactivation failed (${res.status})`);
    }

    return {
      success: json.success !== undefined ? json.success : true,
      message: json.message || "Account deactivated successfully",
    };
  } catch (error: any) {
    logger.error("Account deactivation request failed", { error: error.message, url });
    throw error;
  }
}

export async function changePassword(token: string, data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/profile-security/profile/security/password`;
  logger.info("Making PATCH request to change password", { url });

  try {
    const res = await fetchWithTimeout(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      const error: any = new Error(json.detail || json.message || `Password change failed (${res.status})`);
      error.data = json;
      throw error;
    }

    return {
      success: json.success !== undefined ? json.success : true,
      message: json.message || json.detail || "Password changed successfully",
    };
  } catch (error: any) {
    logger.error("Password change request failed", { error: error.message, url });
    throw error;
  }
}

export async function fetchRecentDevices(token: string): Promise<{ success: boolean; data?: DeviceSession[]; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/profile-security/profile/security/devices`;
  logger.info("Making GET request to fetch recent devices", { url });

  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(json.message || `Failed to fetch recent devices (${res.status})`);
    }

    return {
      success: json.success !== undefined ? json.success : true,
      data: json.data || [],
      message: json.message || "Recent devices fetched successfully",
    };
  } catch (error: any) {
    logger.error("Fetch recent devices request failed", { error: error.message, url });
    throw error;
  }
}

// lib/api.ts

import { leadResponse } from "@/lib/models/types";
import { logger } from "./utils/logger";

// Register types and function
export interface RegisterData {
  fullname: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  success: boolean;
  error?: {
    message: string;
  };
  data?: any;
}

export async function registerUser(userData: RegisterData): Promise<RegisterResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
  
  logger.info("Making POST request to register user", { 
    url, 
    userData: { ...userData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' }
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse registration response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/auth/register (POST)", { status: res.status, response: json });
    
    // Don't throw error for successful HTTP responses, even if success: false
    // Let the calling code handle the success/failure based on the response.success field
    if (!res.ok) {
      logger.error(`Registration failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Registration failed (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Registration request failed", { error: error.message, url });
    throw error;
  }
}

// OTP Verification types and functions
export interface VerifyOTPData {
  email: string;
  otp_type: string;
  code: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: {
    message: string;
  };
}

export async function verifyOTP(otpData: VerifyOTPData): Promise<VerifyOTPResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`;
  
  logger.info("Making POST request to verify OTP", { 
    url, 
    otpData: { ...otpData, code: '[HIDDEN]' }
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse OTP verification response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/auth/otp/verify (POST)", { status: res.status, response: json });
    
    // Don't throw error for successful HTTP responses, even if success: false
    // Let the calling code handle the success/failure based on the response.success field
    if (!res.ok) {
      logger.error(`OTP verification failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `OTP verification failed (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("OTP verification request failed", { error: error.message, url });
    throw error;
  }
}

export interface ResendOTPData {
  email: string;
  otp_type: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  error?: {
    message: string;
  };
}

export async function resendOTP(resendData: ResendOTPData): Promise<ResendOTPResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/resend`;
  
  logger.info("Making POST request to resend OTP", { 
    url, 
    resendData
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse resend OTP response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/auth/otp/resend (POST)", { status: res.status, response: json });
    
    // Don't throw error for successful HTTP responses, even if success: false
    // Let the calling code handle the success/failure based on the response.success field
    if (!res.ok) {
      logger.error(`Resend OTP failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to resend OTP (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Resend OTP request failed", { error: error.message, url });
    throw error;
  }
}

// Reset Password types and functions
export interface ResetPasswordData {
  password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    message: string;
  };
}

export async function resetPassword(resetData: ResetPasswordData, resetToken?: string): Promise<ResetPasswordResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`;
  
  logger.info("Making POST request to reset password", { 
    url, 
    resetData: { password: '[HIDDEN]', confirm_password: '[HIDDEN]' },
    hasToken: !!resetToken
  });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if reset token is provided
    if (resetToken) {
      headers['Authorization'] = `Bearer ${resetToken}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(resetData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse reset password response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/api/v1/auth/reset-password (POST)", { status: res.status, response: json });
    
    // Don't throw error for successful HTTP responses, even if success: false
    // Let the calling code handle the success/failure based on the response.success field
    if (!res.ok) {
      logger.error(`Reset password failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Password reset failed (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Reset password request failed", { error: error.message, url });
    throw error;
  }
}

export async function fetchLeads(token: string): Promise<leadResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("API response:", json);
  
  if (res.status === 401) {
    // Token is invalid/expired, throw specific error
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load leads");
  return json;
}

export interface CreateLeadData {
  // For existing contact
  contact_id?: string;
  
  // For new contact (required if contact_id not provided)
  name?: string;
  email?: string;
  phone?: string;
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

export async function createLead(token: string, leadData: CreateLeadData): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  });

  const json = await res.json();
  console.log("Create lead response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    throw new Error(json.message || "Failed to create lead");
  }
  
  return json;
}

export interface UpdateLeadData {
  contact_id?: string;
  industry: string;
  company_size: string;
  office_location: string;
  lead_status: string;
  lead_source: string;
  assigned_to: string;
  tag: string;
  notes: string;
}

export async function updateLead(token: string, leadId: string, leadData: UpdateLeadData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`;
  
  logger.info("Making PUT request to update lead", { 
    url, 
    leadId, 
    leadData,
    hasToken: !!token 
  });

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  });

  let json;
  try {
    json = await res.json();
  } catch (parseError: any) {
    logger.error("Failed to parse response JSON", { 
      status: res.status,
      statusText: res.statusText,
      parseError: parseError.message 
    });
    throw new Error(`Server returned invalid response (${res.status})`);
  }

  logger.apiResponse(`/leads/${leadId} (PUT)`, { status: res.status, response: json });
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    logger.error(`Update lead failed: ${res.status}`, {
      status: res.status,
      statusText: res.statusText,
      response: json,
      leadData,
      url
    });
    throw new Error(json.message || json.error || `Failed to update lead (${res.status}: ${res.statusText})`);
  }
  
  return json;
}

export async function deleteLead(token: string, leadId: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}`, {
    method: 'DELETE',
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  console.log("Delete lead response status:", res.status);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to delete lead");
  }
  
  return { success: true };
}

export interface ContactResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    contacts: Contact[];
  };
  error: string | null;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchContacts(token: string): Promise<ContactResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Contacts API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load contacts");
  return json;
}

export interface UserResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    users: User[];
  };
  error: string | null;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function fetchUsers(token: string): Promise<UserResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("Users API response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) throw new Error("Failed to load users");
  
  // Transform the direct API response to match our expected interface
  return {
    success: true,
    data: {
      total: json.total,
      page: json.page,
      limit: json.limit,
      users: json.users
    },
    error: null
  };
}

// Profile types and functions
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

export async function fetchProfile(token: string): Promise<ProfileResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/profile`;
  
  logger.info("Making GET request to fetch profile", { url });

  try {
    const res = await fetch(url, {
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

export async function updateProfile(token: string, profileData: UpdateProfileData): Promise<UpdateProfileResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-profile/profile`;
  
  logger.info("Making PATCH request to update profile", { 
    url, 
    profileData
  });

  try {
    const res = await fetch(url, {
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

// Notes API functions
export interface NoteData {
  title: string;
  content: string;
  reminder_date: string;
  reminder_time: string;
}

export interface Note extends NoteData {
  id: string;
}

export interface NotesResponse {
  success: boolean;
  data: {
    notes: Note[];
  };
  error?: string;
}

export async function fetchNotes(token: string): Promise<NotesResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes`;
  
  logger.info("Making GET request to fetch notes", { url });

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
      logger.error("Failed to parse notes response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (GET)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Fetch notes failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to fetch notes (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch notes request failed", { error: error.message, url });
    throw error;
  }
}

export async function createNote(token: string, noteData: NoteData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes`;
  
  logger.info("Making POST request to create note", { 
    url, 
    noteData
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse create note response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (POST)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Create note failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to create note (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Create note request failed", { error: error.message, url });
    throw error;
  }
}

export async function updateNote(token: string, noteId: string, noteData: NoteData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes?note_id=${noteId}`;
  
  logger.info("Making PUT request to update note", { 
    url, 
    noteId,
    noteData
  });

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse update note response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (PUT)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Update note failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to update note (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Update note request failed", { error: error.message, url });
    throw error;
  }
}

// ============================================
// EMAIL MARKETING API FUNCTIONS
// ============================================

import type {
    CreateMailingListData,
    CreateSubscriberData,
    CreateSubscriberResponse,
    DeleteSubscriberResponse,
    MailingListDetailResponse,
    MailingListsResponse,
    SubscribersResponse,
    UpdateMailingListData
} from './types/email-marketing';

// Mailing Lists API
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

// Subscribers API
export async function fetchSubscribers(token: string, page: number = 1, limit: number = 10): Promise<SubscribersResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers?page=${page}&limit=${limit}`;
  
  logger.info("Making GET request to fetch subscribers", { url, page, limit });

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

export interface UpdateSubscriberData {
  name: string;
  email: string;
  phone_number: string;
  position: string;
  company: string;
  address: string;
}

export async function updateSubscriber(token: string, subscriberId: string, data: UpdateSubscriberData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/subscribers/${subscriberId}`;
  
  logger.info("Making PUT request to update subscriber", { url, subscriberId, data });

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

// Campaigns API
import type {
    CampaignDetailResponse,
    CampaignsResponse,
    CreateCampaignData,
    UpdateCampaignData
} from './types/email-marketing';

export async function fetchCampaigns(token: string): Promise<CampaignsResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/campaigns`;
  
  logger.info("Making GET request to fetch campaigns", { url });

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

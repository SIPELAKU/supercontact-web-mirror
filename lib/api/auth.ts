// lib/api/auth.ts
// Authentication API functions: register, OTP, password reset

import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

// ============================================
// Types
// ============================================

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

// ============================================
// Functions
// ============================================

export async function registerUser(userData: RegisterData): Promise<RegisterResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
  
  logger.info("Making POST request to register user", { 
    url, 
    userData: { ...userData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' }
  });

  try {
    const res = await fetchWithTimeout(url, {
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

export async function verifyOTP(otpData: VerifyOTPData): Promise<VerifyOTPResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`;
  
  logger.info("Making POST request to verify OTP", { 
    url, 
    otpData: { ...otpData, code: '[HIDDEN]' }
  });

  try {
    const res = await fetchWithTimeout(url, {
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

export async function resendOTP(resendData: ResendOTPData): Promise<ResendOTPResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/resend`;
  
  logger.info("Making POST request to resend OTP", { 
    url, 
    resendData
  });

  try {
    const res = await fetchWithTimeout(url, {
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
    
    if (resetToken) {
      headers['Authorization'] = `Bearer ${resetToken}`;
    }

    const res = await fetchWithTimeout(url, {
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

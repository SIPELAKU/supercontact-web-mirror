"use client";

import { cookieUtils } from '@/lib/utils/cookies';
import { fetchProfile, ProfileData } from '@/lib/api';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userRole: string | null;
  userCompany: string | null;
  userProfile: ProfileData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  getToken: () => Promise<string>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadProfile = useCallback(async () => {
    try {
      const storedToken = cookieUtils.getAuthToken();
      if (storedToken) {
        const response = await fetchProfile(storedToken);
        if (response.success && response.data) {
          setUserProfile(response.data);
        }
      }
    } catch (error) {
      console.error("Failed to load profile in AuthProvider:", error);
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = cookieUtils.getAuthToken();
      if (cookieUtils.hasAuthToken() && storedToken) {
        // Simply trust the stored token since we don't have /auth/me endpoint
        setToken(storedToken);
        setIsAuthenticated(true);

        // Load role and company from localStorage
        const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const company = typeof window !== 'undefined' ? localStorage.getItem('userCompany') : null;
        setUserRole(role);
        setUserCompany(company);

        // Fetch profile
        reloadProfile();
      }
      setLoading(false);
    };

    checkAuthStatus();

    // Check cookie state when user returns to tab (more efficient than polling)
    const checkCookieChanges = () => {
      if (!cookieUtils.hasAuthToken() && isAuthenticated) {
        // Cookie was removed, logout user
        logout();
      }
    };

    // Use visibility change and focus events instead of setInterval
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkCookieChanges();
      }
    };

    const handleFocus = () => {
      checkCookieChanges();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, reloadProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call actual login API

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await loginRes.json();

      if (!loginRes.ok || !json.success) {
        console.error('Login failed:', json);
        return false;
      }
      console.log('login result', json)
      const accessToken = json.data.access_token;
      const role = json.data.user?.role;
      const company = json.data.user?.company;

      cookieUtils.setAuthToken(accessToken);

      // Store extra info in localStorage
      if (role && typeof window !== 'undefined') localStorage.setItem('userRole', role);
      if (company && typeof window !== 'undefined') localStorage.setItem('userCompany', company);

      setToken(accessToken);
      setUserRole(role);
      setUserCompany(company);
      setIsAuthenticated(true);

      await reloadProfile();

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const getToken = async (): Promise<string> => {
    if (token) {
      return token;
    }

    const storedToken = cookieUtils.getAuthToken();
    if (cookieUtils.hasAuthToken() && storedToken) {
      setToken(storedToken);
      return storedToken;
    }

    throw new Error("No valid token found");
  };

  const logout = () => {
    cookieUtils.removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userCompany');
    }
    setToken(null);
    setUserRole(null);
    setUserCompany(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userRole, userCompany, userProfile, login, logout, loading, getToken, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
"use client";

import { cookieUtils } from '@/lib/utils/cookies';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = cookieUtils.getAuthToken();
      if (cookieUtils.hasAuthToken() && storedToken) {
        // Simply trust the stored token since we don't have /auth/me endpoint
        setToken(storedToken);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuthStatus();

    // Listen for cookie changes (using a polling approach since there's no direct cookie change event)
    const checkCookieChanges = () => {
      if (!cookieUtils.hasAuthToken() && isAuthenticated) {
        // Cookie was removed, logout user
        setToken(null);
        setIsAuthenticated(false);
      }
    };

    const interval = setInterval(checkCookieChanges, 1000); // Check every second
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

      cookieUtils.setAuthToken(accessToken);

      setToken(accessToken);
      setIsAuthenticated(true);

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
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, loading, getToken }}>
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
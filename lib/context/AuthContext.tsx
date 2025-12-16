"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cookieUtils } from '@/lib/utils/cookies';

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
    // Check if user is already logged in (from cookies)
    const checkAuthStatus = async () => {
      const storedToken = cookieUtils.getAuthToken();
      if (cookieUtils.hasAuthToken() && storedToken) {
        // Validate token by making a test API call
        try {
          const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          
          if (testRes.ok) {
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            cookieUtils.removeAuthToken();
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Network error or token invalid, remove it
          cookieUtils.removeAuthToken();
          setToken(null);
          setIsAuthenticated(false);
        }
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
      
      // Store token in cookie (secure, httpOnly in production)
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
    // If we have a valid token, validate it first
    if (token) {
      try {
        const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (testRes.ok) {
          return token;
        } else {
          // Token is invalid, logout user
          logout();
          throw new Error("Token expired or invalid");
        }
      } catch (error) {
        // Network error or token invalid, logout user
        logout();
        throw new Error("Token validation failed");
      }
    }

    // If no token, try to get from cookies
    const storedToken = cookieUtils.getAuthToken();
    if (cookieUtils.hasAuthToken() && storedToken) {
      try {
        const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        
        if (testRes.ok) {
          setToken(storedToken);
          return storedToken;
        } else {
          // Token is invalid, remove it
          cookieUtils.removeAuthToken();
          throw new Error("Stored token is invalid");
        }
      } catch (error) {
        cookieUtils.removeAuthToken();
        throw new Error("Token validation failed");
      }
    }

    // No valid token found
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
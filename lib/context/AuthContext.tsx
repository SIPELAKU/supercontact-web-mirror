"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check if user is already logged in (from localStorage)
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && storedToken !== 'dummy_token') {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

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
      
      // Store token
      localStorage.setItem('auth_token', accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const getToken = async (): Promise<string> => {
    // If we have a valid token, return it
    if (token) {
      return token;
    }

    // If no token, try to get from localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && storedToken !== 'dummy_token') {
      setToken(storedToken);
      return storedToken;
    }

    // If still no token, perform auto-login (for backward compatibility)
    console.warn('No token found, performing auto-login...');
    const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin", password: "admin" }),
    });

    const json = await loginRes.json();
    if (!loginRes.ok || !json.success) {
      throw new Error("Auto-login failed");
    }

    const accessToken = json.data.access_token;
    localStorage.setItem('auth_token', accessToken);
    setToken(accessToken);
    setIsAuthenticated(true);
    
    return accessToken;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
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
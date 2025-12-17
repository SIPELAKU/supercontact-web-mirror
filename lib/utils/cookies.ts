// lib/utils/cookies.ts
import Cookies from 'js-cookie';

export const AUTH_COOKIE_NAME = 'access_token';

export const cookieUtils = {
  // Set authentication token
  setAuthToken: (token: string) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
      expires: 1/24, // 1 hour (1/24 of a day)
      secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
      sameSite: 'strict' // CSRF protection
    });
  },

  // Get authentication token
  getAuthToken: (): string | undefined => {
    return Cookies.get(AUTH_COOKIE_NAME);
  },

  // Remove authentication token
  removeAuthToken: () => {
    Cookies.remove(AUTH_COOKIE_NAME);
  },

  // Check if user has valid token
  hasAuthToken: (): boolean => {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    return Boolean(token && token !== 'dummy_token');
  }
};
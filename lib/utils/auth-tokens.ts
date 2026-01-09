import { randomBytes } from 'crypto';

/**
 * Generate a secure random token for password reset
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex string token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a token with expiration time
 * @param expirationMinutes - Minutes until token expires (default: 60)
 * @returns Object with token and expiration timestamp
 */
export function generateTokenWithExpiration(expirationMinutes: number = 60) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  
  return {
    token,
    expiresAt,
  };
}

/**
 * Check if a token has expired
 * @param expirationDate - The expiration date to check
 * @returns True if token has expired
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}

/**
 * Hash a token for secure storage
 * @param token - The token to hash
 * @returns Hashed token (you might want to use bcrypt or similar in production)
 */
export function hashToken(token: string): string {
  // In production, use a proper hashing library like bcrypt
  // This is a simple example using built-in crypto
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}
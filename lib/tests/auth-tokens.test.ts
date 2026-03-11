/**
 * AUTH TOKENS UTILITY TESTS
 * 
 * Simple test suite for ensuring auth tokens logic 
 * works as expected. 
 */

import { generateSecureToken, generateTokenWithExpiration, isTokenExpired, hashToken } from '../utils/auth-tokens';

/**
 * @testcase generateSecureToken Validation
 * @description Verifies that a secure token of expected length is generated.
 */
const testGenerateSecureToken = () => {
    console.log("Running generateSecureToken Validation...");
    const token = generateSecureToken(16);
    
    // 16 bytes = 32 hex characters
    if (typeof token === 'string' && token.length === 32) {
        console.log("PASS: generateSecureToken returns correct length hex string.");
    } else {
        console.error("FAIL: generateSecureToken returned incorrect size or type.");
    }
    
    const tokenDefault = generateSecureToken();
    if (tokenDefault.length === 64) {
        console.log("PASS: generateSecureToken default length is correct.");
    } else {
        console.error("FAIL: generateSecureToken default length is incorrect.");
    }
};

/**
 * @testcase generateTokenWithExpiration Validation
 * @description Verifies token generation with time limit.
 */
const testGenerateTokenWithExpiration = () => {
    console.log("Running generateTokenWithExpiration Validation...");
    const result = generateTokenWithExpiration(30);

    if (result.token && result.expiresAt instanceof Date) {
        const timeDiff = result.expiresAt.getTime() - Date.now();
        // Allow tiny delta margin for execution time
        if (Math.abs(timeDiff - 30 * 60 * 1000) < 1000) {
            console.log("PASS: generateTokenWithExpiration correctly calculates expiration date.");
        } else {
            console.error("FAIL: generateTokenWithExpiration timeframe incorrect.");
        }
    } else {
        console.error("FAIL: generateTokenWithExpiration output format is incorrect.");
    }
};

/**
 * @testcase isTokenExpired Validation
 * @description Verifies the logic determining if a token date has been passed.
 */
const testIsTokenExpired = () => {
    console.log("Running isTokenExpired Validation...");
    
    const pastDate = new Date(Date.now() - 10000); // 10 seconds ago
    if (isTokenExpired(pastDate) === true) {
        console.log("PASS: isTokenExpired correctly identifies past dates.");
    } else {
        console.error("FAIL: isTokenExpired failed to identify past dates.");
    }
    
    const futureDate = new Date(Date.now() + 10000); // 10 seconds into the future
    if (isTokenExpired(futureDate) === false) {
        console.log("PASS: isTokenExpired correctly identifies future dates.");
    } else {
        console.error("FAIL: isTokenExpired falsely identified a future date as expired.");
    }
};

/**
 * @testcase hashToken Validation
 * @description Verifies token hashing consistency.
 */
const testHashToken = () => {
    console.log("Running hashToken Validation...");
    const tokenToHash = 'secret_token_example';
    const hash1 = hashToken(tokenToHash);
    const hash2 = hashToken(tokenToHash);
    
    if (hash1 === hash2 && hash1.length > 0) {
        console.log("PASS: hashToken produces consistent deterministic output.");
    } else {
        console.error("FAIL: hashToken results are inconsistent or empty.");
    }
};

// Execute Test Suite
export const runAuthTokensTestSuite = () => {
    console.log("--- STARTING AUTH TOKENS TEST SUITE ---");
    testGenerateSecureToken();
    testGenerateTokenWithExpiration();
    testIsTokenExpired();
    testHashToken();
    console.log("--- TEST SUITE COMPLETED ---");
};

// Auto-run if in development environment
if (process.env.NODE_ENV === 'development') {
    // runAuthTokensTestSuite();
}

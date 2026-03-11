/**
 * COOKIES UTILITY TESTS
 * 
 * Simple test suite for ensuring cookie wrapper logic 
 * adheres to business requirements and correctly interfaces with js-cookie.
 */

import { cookieUtils, AUTH_COOKIE_NAME } from '../utils/cookies';
import Cookies from 'js-cookie';

/**
 * @testcase Cookie Constant Validation
 * @description Verifies that the correct cookie name is used for authentication.
 */
const testCookieFormat = () => {
    console.log("Running Cookie Constant Validation...");
    if (AUTH_COOKIE_NAME === 'access_token') {
        console.log("PASS: AUTH_COOKIE_NAME is correct ('access_token').");
    } else {
        console.error("FAIL: AUTH_COOKIE_NAME is incorrect. Got:", AUTH_COOKIE_NAME);
    }
};

/**
 * @testcase hasAuthToken Validation
 * @description Verifies that the hasAuthToken util correctly identifies valid, dummy, and missing tokens.
 */
const testHasAuthToken = () => {
    console.log("Running hasAuthToken Validation...");
    
    // Store original function to restore later
    const originalGet = Cookies.get;
    
    try {
        // 1. Mock with a valid token
        Cookies.get = ((name?: string) => {
            if (name === AUTH_COOKIE_NAME) return 'valid_token_123';
            return undefined;
        }) as any;
        
        let result = cookieUtils.hasAuthToken();
        if (result === true) {
            console.log("PASS: hasAuthToken returns true for valid token.");
        } else {
            console.error("FAIL: hasAuthToken should return true for valid token.");
        }

        // 2. Mock with dummy token
        Cookies.get = ((name?: string) => {
            if (name === AUTH_COOKIE_NAME) return 'dummy_token';
            return undefined;
        }) as any;
        
        result = cookieUtils.hasAuthToken();
        if (result === false) {
            console.log("PASS: hasAuthToken returns false for 'dummy_token'.");
        } else {
            console.error("FAIL: hasAuthToken should return false for 'dummy_token'.");
        }
        
        // 3. Mock with undefined/missing token
        Cookies.get = (() => undefined) as any;
        
        result = cookieUtils.hasAuthToken();
        if (result === false) {
            console.log("PASS: hasAuthToken returns false for missing token.");
        } else {
            console.error("FAIL: hasAuthToken should return false for missing token.");
        }
    } finally {
        // Restore original JS Cookie functionality
        Cookies.get = originalGet;
    }
};

/**
 * @testcase Authentication Actions Check
 * @description Verifies that the set and remove auth utilities are defined and callable
 */
const testAuthActions = () => {
    console.log("Running Auth Actions Validation...");
    
    const hasSet = typeof cookieUtils.setAuthToken === 'function';
    const hasRemove = typeof cookieUtils.removeAuthToken === 'function';
    const hasGet = typeof cookieUtils.getAuthToken === 'function';

    if (hasSet && hasRemove && hasGet) {
        console.log("PASS: Auth action functions are fully defined.");
    } else {
        console.error("FAIL: Missing expected auth action functions.");
    }
};

// Execute Test Suite
export const runCookiesTestSuite = () => {
    console.log("--- STARTING COOKIES TEST SUITE ---");
    testCookieFormat();
    testHasAuthToken();
    testAuthActions();
    console.log("--- TEST SUITE COMPLETED ---");
};

// Auto-run if in development environment
if (process.env.NODE_ENV === 'development') {
    // runCookiesTestSuite();
}

/**
 * ERROR HANDLER UTILITY TESTS
 * 
 * Test suite for verifying error message extraction from various
 * API error shapes and fallback behaviors.
 */

import { getErrorMessage, handleError } from '../utils/errorHandler';

/**
 * @testcase String Error Passthrough
 * @description When error is already a string, return it directly.
 */
const testStringError = () => {
    console.log("Running String Error Passthrough...");
    const result = getErrorMessage("Something went wrong");
    if (result === "Something went wrong") {
        console.log("PASS: String error returned as-is.");
    } else {
        console.error("FAIL: Expected 'Something went wrong', got:", result);
    }
};

/**
 * @testcase Fallback Message
 * @description When error is null/undefined, return fallback.
 */
const testFallbackMessage = () => {
    console.log("Running Fallback Message...");
    
    const result1 = getErrorMessage(null);
    if (result1 === "An error occurred") {
        console.log("PASS: Returns default fallback for null.");
    } else {
        console.error("FAIL: Expected default fallback, got:", result1);
    }

    const result2 = getErrorMessage(undefined, "Custom fallback");
    if (result2 === "Custom fallback") {
        console.log("PASS: Returns custom fallback for undefined.");
    } else {
        console.error("FAIL: Expected 'Custom fallback', got:", result2);
    }
};

/**
 * @testcase Nested error.data.detail
 * @description Verifies extraction from { data: { detail: "..." } }.
 */
const testNestedDataDetail = () => {
    console.log("Running Nested error.data.detail...");
    const error = { data: { detail: "Token expired" } };
    const result = getErrorMessage(error);
    if (result === "Token expired") {
        console.log("PASS: Extracted detail from error.data.");
    } else {
        console.error("FAIL: Expected 'Token expired', got:", result);
    }
};

/**
 * @testcase Axios-style response.data.detail
 * @description Verifies extraction from { response: { data: { detail: "..." } } }.
 */
const testAxiosResponseDetail = () => {
    console.log("Running Axios-style response.data.detail...");
    const error = { response: { data: { detail: "Unauthorized access" } } };
    const result = getErrorMessage(error);
    if (result === "Unauthorized access") {
        console.log("PASS: Extracted detail from response.data.");
    } else {
        console.error("FAIL: Expected 'Unauthorized access', got:", result);
    }
};

/**
 * @testcase Details Array Formatting
 * @description Verifies that details arrays get formatted with field names.
 */
const testDetailsArray = () => {
    console.log("Running Details Array Formatting...");
    const error = {
        details: [
            { field: "email", message: "is required" },
            { field: "password", message: "must be at least 8 characters" }
        ]
    };
    const result = getErrorMessage(error);
    if (result.includes("email: is required") && result.includes("password: must be at least 8 characters")) {
        console.log("PASS: Details array formatted correctly.");
    } else {
        console.error("FAIL: Details formatting incorrect, got:", result);
    }
};

/**
 * @testcase Top-level message Property
 * @description Verifies extraction from standard Error objects { message: "..." }.
 */
const testMessageProperty = () => {
    console.log("Running Top-level message Property...");
    const error = new Error("Network timeout");
    const result = getErrorMessage(error);
    if (result === "Network timeout") {
        console.log("PASS: Extracted from Error.message.");
    } else {
        console.error("FAIL: Expected 'Network timeout', got:", result);
    }
};

/**
 * @testcase handleError Returns Message
 * @description Verifies handleError logs and returns the extracted message.
 */
const testHandleError = () => {
    console.log("Running handleError Returns Message...");
    // Suppress console.error output during test
    const originalError = console.error;
    console.error = () => {};
    
    const result = handleError(new Error("Test error"), "TestContext");
    
    console.error = originalError;
    
    if (result === "Test error") {
        console.log("PASS: handleError returned correct message.");
    } else {
        console.error("FAIL: Expected 'Test error', got:", result);
    }
};

// Execute Test Suite
export const runErrorHandlerTestSuite = () => {
    console.log("--- STARTING ERROR HANDLER TEST SUITE ---");
    testStringError();
    testFallbackMessage();
    testNestedDataDetail();
    testAxiosResponseDetail();
    testDetailsArray();
    testMessageProperty();
    testHandleError();
    console.log("--- TEST SUITE COMPLETED ---");
};

// Auto-run if in development environment
if (process.env.NODE_ENV === 'development') {
    // runErrorHandlerTestSuite();
}

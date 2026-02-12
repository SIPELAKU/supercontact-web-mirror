// lib/utils/errorHandler.ts

/**
 * Extracts a readable error message from various error types
 * @param error - The error object, string, or any value
 * @param fallbackMessage - Default message if no readable error is found
 * @returns A readable error message string
 */
export function getErrorMessage(error: any, fallbackMessage: string = "An error occurred"): string {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Helper to format details array
  const formatDetails = (details: any[]) => {
    if (!Array.isArray(details) || details.length === 0) return null;
    return details
      .map((d: any) => `${d.field ? `${d.field}: ` : ''}${d.message}`)
      .join('\n');
  };

  // If it's an object with a message property
  if (error && typeof error === 'object') {
    // 1. Check for nested error structure: { error: { message: "...", details: [...] } }
    if (error.error && typeof error.error === 'object') {
      const details = formatDetails(error.error.details);
      if (details) return details;
      if (error.error.message && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    // 2. Check for nested data error structure: { data: { error: { message: "...", details: [...] } } }
    if (error.data && error.data.error && typeof error.data.error === 'object') {
      const apiError = error.data.error;
      const details = formatDetails(apiError.details);
      if (details) return details;
      if (apiError.message && typeof apiError.message === 'string') {
        return apiError.message;
      }
    }

    // 3. Check for API response errors (Axios/Fetch style): { response: { data: { error: { details: [...] } } } }
    if (error.response && error.response.data) {
      const respData = error.response.data;
      if (typeof respData === 'string') return respData;

      if (respData.error && typeof respData.error === 'object') {
        const details = formatDetails(respData.error.details);
        if (details) return details;
        if (respData.error.message) return respData.error.message;
      }

      if (respData.message) return respData.message;
    }

    // 4. Handle top-level details or message
    const topLevelDetails = formatDetails(error.details);
    if (topLevelDetails) return topLevelDetails;

    if (error.message && typeof error.message === 'string') {
      // Avoid returning generic "Object object" or empty messages
      if (error.message !== "[object Object]") {
        return error.message;
      }
    }

    if (error.error && typeof error.error === 'string') {
      return error.error;
    }

    if (error.data && typeof error.data === 'object' && error.data.message) {
      return error.data.message;
    }
  }

  // If nothing else works, return the fallback
  return fallbackMessage;
}

/**
 * Logs an error with context and returns a user-friendly message
 * @param error - The error to log and process
 * @param context - Additional context for logging
 * @param fallbackMessage - Default message for users
 * @returns A user-friendly error message
 */
export function handleError(error: any, context: string, fallbackMessage?: string): string {
  console.error(`${context}:`, error);

  const message = getErrorMessage(error, fallbackMessage);

  // Log additional context if available
  if (error && typeof error === 'object') {
    console.error(`${context} - Full error object:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response,
      data: error.data
    });
  }

  return message;
}
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

  // If it's an object with a message property
  if (error && typeof error === 'object') {
    // Try different common error message properties
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    
    // Handle nested error structure like: { error: { message: "..." } }
    if (error.error && typeof error.error === 'object' && error.error.message) {
      return error.error.message;
    }
    
    if (error.error && typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.data && error.data.message && typeof error.data.message === 'string') {
      return error.data.message;
    }
    
    // Handle nested data error structure
    if (error.data && error.data.error && error.data.error.message) {
      return error.data.error.message;
    }
    
    // For API response errors
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.error) {
        if (typeof error.response.data.error === 'string') {
          return error.response.data.error;
        }
        if (error.response.data.error.message) {
          return error.response.data.error.message;
        }
      }
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
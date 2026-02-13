// lib/api/api-client.ts
// Shared API client utilities

export const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Fetch with a timeout using AbortController
 */
export async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

// lib/utils/jwt.ts

/**
 * Decodes a JWT's payload and extracts the user id. Returns "" if the token
 * is malformed or carries no recognizable user-id claim.
 */
export function getUserIdFromToken(token: string): string {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.id || payload.user_id || "";
  } catch (e) {
    console.error("[JWT] Failed to parse token", e);
    return "";
  }
}

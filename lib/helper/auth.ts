import { cookies } from "next/headers";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function requireAuth() {
  const token = getAccessToken();
  if (!token) throw new Error("NOT_AUTHENTICATED");
  return token;
}

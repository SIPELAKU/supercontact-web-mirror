// lib/config/appRoutes.ts
//
// The logged-in app's pages, by path prefix. One list for the middleware
// (which sends a visitor without a session to /login) and for the theme
// (dark mode applies to these pages only; the public site stays light).

export const APP_ROUTE_PREFIXES = [
  "/analytics",
  "/contact",
  "/dashboard",
  "/data-intelligence",
  "/demo",
  "/email-marketing",
  "/inbox",
  "/knowledge-base",
  "/lead-management",
  "/notes",
  "/notifications",
  "/omnichannel",
  "/profile",
  "/sales",
  "/settings",
  "/smart-capture",
  "/support",
  "/test",
  "/whatsapp-marketing",
] as const;

export function isAppPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

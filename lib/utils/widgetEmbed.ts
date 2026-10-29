// lib/utils/widgetEmbed.ts
//
// The API and WebSocket addresses written into the Web Widget embed snippet.
//
// The snippet runs on the TENANT's website, so both must be absolute and must
// point at the API itself. NEXT_PUBLIC_API_URL is "/api/proxy" on our deploys:
// relative, it resolves against the tenant's own domain and the widget never
// loads. Going through our proxy with an absolute URL would not do either -
// the proxy drops Origin/Referer, so the API rejects every widget that has
// Allowed Domains set. NEXT_PUBLIC_WS_URL is the API's absolute address on
// every deploy (wss://<env>-supersales.smartcore.id/api/v1), so the REST
// address is that same base over https. The env values themselves are only
// read here, never changed.

export interface WidgetEmbedUrls {
  /** For data-api-url. */
  apiUrl: string;
  /** For data-ws-url. */
  wsUrl: string;
}

const HTTP = /^https?:\/\//i;
const WS = /^wss?:\/\//i;

const trimSlash = (value?: string) => (value ?? "").trim().replace(/\/+$/, "");

/** `null` when no absolute address can be built - the snippet would not work. */
export function widgetEmbedUrls(env: { apiUrl?: string; wsUrl?: string }): WidgetEmbedUrls | null {
  const api = trimSlash(env.apiUrl);
  const ws = trimSlash(env.wsUrl);

  const apiUrl = HTTP.test(api) ? api : WS.test(ws) ? ws.replace(/^ws/i, "http") : "";
  if (!apiUrl) return null;

  const wsUrl = WS.test(ws) ? ws : apiUrl.replace(/^http/i, "ws");
  return { apiUrl, wsUrl };
}

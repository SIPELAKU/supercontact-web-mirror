// lib/api/bot-playground.ts
// Bot Playground (Fase A) - dry-run the widget answer-bot with zero side
// effects. Mirrors POST /bot-playground/ask (gate omnichannel:setup).
import { fetchWithTimeout } from "./api-client";
import type {
  BotPlaygroundAskRequest,
  BotPlaygroundAskResponse,
} from "@/lib/types/botPlayground";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/bot-playground`;

export async function askBotPlayground(
  token: string,
  payload: BotPlaygroundAskRequest,
): Promise<BotPlaygroundAskResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to run the bot playground");
  }

  return json.data || json;
}

// ---------- Fase B/C ----------
import type {
  BotActivateResponse,
  BotReadinessResponse,
  BotShadowListResponse,
  BotShadowResult,
  BotTestCase,
  BotTestSetRunResponse,
  CreateBotTestCaseRequest,
} from "@/lib/types/botPlayground";
import type { BotPlaygroundOverrides } from "@/lib/types/botPlayground";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token: string): HeadersInit {
  return { ...authHeaders(token), "Content-Type": "application/json" };
}

async function handle<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json();
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw json || new Error(fallback);
  return (json.data ?? json) as T;
}

export async function listBotTestCases(
  token: string,
  accountId: string,
): Promise<BotTestCase[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/test-set?account_id=${encodeURIComponent(accountId)}`,
    { headers: authHeaders(token) },
  );
  return handle<BotTestCase[]>(res, "Failed to load test cases");
}

export async function createBotTestCase(
  token: string,
  payload: CreateBotTestCaseRequest,
): Promise<BotTestCase> {
  const res = await fetchWithTimeout(`${API_BASE}/test-set`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  return handle<BotTestCase>(res, "Failed to save test case");
}

export async function deleteBotTestCase(
  token: string,
  caseId: string,
): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/test-set/${caseId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handle(res, "Failed to delete test case");
}

export async function runBotTestSet(
  token: string,
  accountId: string,
  overrides?: BotPlaygroundOverrides,
): Promise<BotTestSetRunResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/test-set/run`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ account_id: accountId, overrides }),
  });
  return handle<BotTestSetRunResponse>(res, "Failed to run test set");
}

export async function listBotShadowResults(
  token: string,
  accountId: string,
  status?: "pending" | "approved" | "rejected",
): Promise<BotShadowListResponse> {
  const params = new URLSearchParams({ account_id: accountId });
  if (status) params.set("status", status);
  const res = await fetchWithTimeout(`${API_BASE}/shadow?${params}`, {
    headers: authHeaders(token),
  });
  return handle<BotShadowListResponse>(res, "Failed to load shadow results");
}

export async function reviewBotShadowResult(
  token: string,
  shadowId: string,
  approve: boolean,
): Promise<BotShadowResult> {
  const res = await fetchWithTimeout(`${API_BASE}/shadow/${shadowId}/review`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ approve }),
  });
  return handle<BotShadowResult>(res, "Failed to review shadow result");
}

export async function getBotReadiness(
  token: string,
  accountId: string,
): Promise<BotReadinessResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE}/readiness?account_id=${encodeURIComponent(accountId)}`,
    { headers: authHeaders(token) },
  );
  return handle<BotReadinessResponse>(res, "Failed to load readiness");
}

export async function activateBot(
  token: string,
  accountId: string,
): Promise<BotActivateResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/activate`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ account_id: accountId }),
  });
  return handle<BotActivateResponse>(res, "Failed to activate the bot");
}

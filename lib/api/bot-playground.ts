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

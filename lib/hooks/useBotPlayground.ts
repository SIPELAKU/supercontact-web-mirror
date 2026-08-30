"use client";

import { useMutation } from "@tanstack/react-query";
import { askBotPlayground } from "@/lib/api/bot-playground";
import type {
  BotPlaygroundAskRequest,
  BotPlaygroundAskResponse,
} from "@/lib/types/botPlayground";
import { useAuth } from "../context/AuthContext";

// One-shot ask; nothing is cached or invalidated because the endpoint is a
// pure dry-run - it writes nothing on the server.
export function useBotPlaygroundAsk() {
  const { token } = useAuth();
  return useMutation<BotPlaygroundAskResponse, unknown, BotPlaygroundAskRequest>({
    mutationFn: (payload) => {
      if (!token) throw new Error("No authentication token");
      return askBotPlayground(token, payload);
    },
  });
}

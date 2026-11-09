// lib/utils/deflectionReport.ts
//
// The share of ended bot chats that needed no agent, as shown to clients. The
// API works it out; null until it sends the number, so the card keeps its old
// figure rather than showing a false 0%.

export function resolvedWithoutAgentView(
  summary:
    | {
        resolved_without_agent?: number | null;
        ended_bot_chats?: number | null;
        resolved_without_agent_pct?: number | null;
      }
    | null
    | undefined,
): { pct: string; caption: string } | null {
  const pct = summary?.resolved_without_agent_pct;
  if (typeof pct !== "number") return null;
  return {
    pct: `${pct.toFixed(1)}%`,
    caption: `${summary?.resolved_without_agent ?? 0} dari ${summary?.ended_bot_chats ?? 0} chat`,
  };
}

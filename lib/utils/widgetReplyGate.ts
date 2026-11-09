// lib/utils/widgetReplyGate.ts
//
// Who may reply to a web widget chat (W5): only the agent who accepted it.
// Nobody is assigned automatically, so until someone clicks Accept the chat
// stays in Live & unassigned for every agent to read. Other channels are not
// affected.

import type { ChannelType } from "@/lib/types/omnichannel";

// `open`: the reply box. `needs_accept`: the Accept button. `taken`: another
// agent holds the chat. `loading`: not known yet, so neither is offered.
export type WidgetReplyState = "open" | "needs_accept" | "taken" | "loading";

export function widgetReplyState({
  channelType,
  loaded = true,
  assignedUserId,
  currentUserId,
}: {
  channelType?: ChannelType | null;
  loaded?: boolean;
  assignedUserId?: string | null;
  currentUserId?: string | null;
}): WidgetReplyState {
  if (channelType !== "web_widget") return "open";
  if (!loaded) return "loading";
  if (!assignedUserId) return "needs_accept";
  return assignedUserId === currentUserId ? "open" : "taken";
}

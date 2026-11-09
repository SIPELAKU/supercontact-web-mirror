"use client";

import { Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { useAcceptConversation } from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import type { WidgetReplyState } from "@/lib/utils/widgetReplyGate";

interface WidgetReplyGateProps {
  conversationId: string;
  state: Exclude<WidgetReplyState, "open">;
  ownerName?: string | null;
}

// Stands in for the reply box on a web widget chat the agent does not hold
// (W5): an Accept button, or who holds it.
export function WidgetReplyGate({ conversationId, state, ownerName }: WidgetReplyGateProps) {
  const accept = useAcceptConversation();

  if (state === "loading") {
    return <div aria-busy="true" className="h-14 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (state === "taken") {
    return (
      <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        This chat is being handled by {ownerName || "another agent"}.
      </p>
    );
  }

  const handleAccept = () =>
    accept.mutate(conversationId, {
      onError: (error) => {
        if ((error as { status?: number }).status === 409) {
          notify.info("Already taken", { description: "Another agent accepted this chat first." });
        } else {
          notify.error("Failed to accept the chat", { description: error.message });
        }
      },
    });

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#5479EE] bg-[#EEF2FD] px-4 py-3">
      <p className="text-sm text-gray-700">Take this chat to reply.</p>
      <AppButton onClick={handleAccept} disabled={accept.isPending} variantStyle="primary">
        {accept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
      </AppButton>
    </div>
  );
}

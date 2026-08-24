"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useConversationQueues, useClaimNext } from "@/lib/hooks/useAgents";
import type { ConversationWithMessages } from "@/lib/types/omnichannel";

interface ClaimNextControlProps {
  /** Called with the freshly-claimed conversation so the workspace can select it. */
  onClaimed: (conversation: ConversationWithMessages) => void;
}

// Views-rail footer control: pick an active queue and race-safely pull the
// next-in-line conversation. Hidden (replaced by a hint) when no active queues
// exist. Reuses App* primitives + notify/handleError.
export function ClaimNextControl({ onClaimed }: ClaimNextControlProps) {
  const { data: queues = [], isLoading } = useConversationQueues();
  const claimNext = useClaimNext();
  const [queueId, setQueueId] = useState("");

  // Default to the first active queue once loaded, and keep the selection valid
  // if the list changes underneath us.
  useEffect(() => {
    if (queues.length === 0) {
      if (queueId) setQueueId("");
      return;
    }
    if (!queues.some((q) => q.id === queueId)) {
      setQueueId(queues[0].id);
    }
  }, [queues, queueId]);

  const options = useMemo(
    () => queues.map((q) => ({ value: q.id, label: q.name })),
    [queues]
  );

  const handleClaim = () => {
    if (!queueId) return;
    claimNext.mutate(queueId, {
      onSuccess: (result) => {
        if (result.claimed && result.conversation) {
          onClaimed(result.conversation);
        } else {
          notify.info("Queue is empty");
        }
      },
      onError: (error) =>
        notify.error("Error", { description: handleError(error, "Claim next") }),
    });
  };

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
        Pull work
      </div>

      {isLoading ? (
        <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
      ) : queues.length === 0 ? (
        <p className="text-xs leading-relaxed text-gray-400">
          No active queues.{" "}
          <Link
            href="/settings/support/routing"
            className="font-semibold text-[#3E63D8] hover:underline"
          >
            Set up routing
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-2">
          <AppSelect
            isBgWhite
            fullWidth
            height="36px"
            value={queueId}
            options={options}
            onChange={(e) => setQueueId(e.target.value as string)}
          />
          <AppButton
            fullWidth
            onClick={handleClaim}
            isLoading={claimNext.isPending}
            disabled={!queueId || claimNext.isPending}
            startIcon={<Inbox size={16} />}
          >
            Claim next
          </AppButton>
        </div>
      )}
    </div>
  );
}

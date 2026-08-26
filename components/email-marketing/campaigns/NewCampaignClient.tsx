"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CampaignComposer, { CampaignSubmitPayload } from "./CampaignComposer";
import { useCreateCampaign } from "@/lib/hooks/useCampaigns";
import { notify } from "@/lib/notifications";

export default function NewCampaignClient() {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const [apiErrors, setApiErrors] = useState<any[] | null>(null);

  const handleSubmit = async (payload: CampaignSubmitPayload) => {
    setApiErrors(null);
    try {
      await createMutation.mutateAsync({
        recipient_source: payload.recipientSource,
        editor_type: payload.editorType,
        subject: payload.subject.trim(),
        html_content:
          payload.action === "send"
            ? payload.htmlContent.trim()
            : payload.htmlContent?.trim() || undefined,
        action: payload.action,
        mailing_list_ids:
          payload.recipientSource === "mailing_list" && payload.mailingListIds.length > 0
            ? payload.mailingListIds
            : undefined,
        contact_ids:
          payload.recipientSource === "subscriber" && payload.subscriberIds.length > 0
            ? payload.subscriberIds
            : undefined,
        // null, not undefined: an empty choice means "follow the company
        // default", and `undefined` is dropped from the JSON, which on a PATCH
        // reads as "leave it alone" - so picking the default silently kept the
        // old server.
        mail_server_id: payload.mailServerId || null,
      });

      notify.success(
        payload.action === "draft"
          ? "Campaign saved as draft."
          : "Campaign created and queued for sending."
      );
      router.push("/email-marketing/campaigns");
    } catch (err: any) {
      if (err?.details && Array.isArray(err.details)) {
        setApiErrors(err.details);
        notify.error("The server rejected this campaign.");
      } else {
        const message =
          typeof err?.message === "string"
            ? err.message.replace(/_/g, " ")
            : "Failed to create campaign.";
        notify.error(message);
      }
    }
  };

  return (
    <CampaignComposer
      mode="create"
      isSaving={createMutation.isPending}
      apiErrors={apiErrors}
      onSubmit={handleSubmit}
    />
  );
}

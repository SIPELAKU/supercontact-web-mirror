"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@mui/material";

import CampaignComposer, { CampaignSubmitPayload } from "./CampaignComposer";
import { AppButton } from "@/components/ui/app-button";
import PageHeader from "@/components/ui/page-header";
import { useCampaignDetail, useUpdateCampaign } from "@/lib/hooks/useCampaigns";
import { canEditCampaign, campaignEditBlockedReason } from "@/lib/constants/campaign-status";
import { notify } from "@/lib/notifications";

export default function EditCampaignClient() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params.id);

  const { data, isLoading, isError } = useCampaignDetail(campaignId);
  const updateMutation = useUpdateCampaign();
  const [apiErrors, setApiErrors] = useState<any[] | null>(null);

  const campaign = data?.data ?? null;

  const handleSubmit = async (payload: CampaignSubmitPayload) => {
    setApiErrors(null);
    try {
      await updateMutation.mutateAsync({
        campaignId,
        data: {
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
          mail_server_id: payload.mailServerId || undefined,
        },
      });

      notify.success(
        payload.action === "draft"
          ? "Campaign saved as draft."
          : "Campaign queued for sending."
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
            : "Failed to update campaign.";
        notify.error(message);
      }
    }
  };

  // Guard the route the same way the API does, so a bookmarked /edit URL for a
  // Sent campaign explains itself instead of failing on submit.
  if (!isLoading && campaign && !canEditCampaign(campaign.status)) {
    return (
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <PageHeader
          title="Edit Campaign"
          breadcrumbs={[
            { label: "Email Marketing", href: "/email-marketing" },
            { label: "Campaigns", href: "/email-marketing/campaigns" },
            { label: "Edit" },
          ]}
        />
        <Alert
          severity="warning"
          action={
            <AppButton
              variantStyle="outline"
              onClick={() => router.push("/email-marketing/campaigns")}
            >
              Back to Campaigns
            </AppButton>
          }
        >
          {campaignEditBlockedReason(campaign.status)} — this one is{" "}
          <strong>{campaign.status}</strong>.
        </Alert>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <PageHeader
          title="Edit Campaign"
          breadcrumbs={[
            { label: "Email Marketing", href: "/email-marketing" },
            { label: "Campaigns", href: "/email-marketing/campaigns" },
            { label: "Edit" },
          ]}
        />
        <Alert
          severity="error"
          action={
            <AppButton
              variantStyle="outline"
              onClick={() => router.push("/email-marketing/campaigns")}
            >
              Back to Campaigns
            </AppButton>
          }
        >
          We could not load this campaign.
        </Alert>
      </div>
    );
  }

  return (
    <CampaignComposer
      mode="edit"
      campaign={campaign}
      isLoading={isLoading}
      isSaving={updateMutation.isPending}
      apiErrors={apiErrors}
      onSubmit={handleSubmit}
    />
  );
}

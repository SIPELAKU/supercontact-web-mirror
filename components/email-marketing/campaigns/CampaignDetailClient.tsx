"use client";

// components/email-marketing/campaigns/CampaignDetailClient.tsx
//
// The campaign record page. Until now the module had none: only /new and
// /[id]/edit existed, so a campaign's statistics lived inside a Dialog with
// no URL anyone could share. This is where a row click lands.
//
// A Draft has no statistics worth reading, so it redirects straight to the
// composer — the same "route by state" rule LeadMagnetsTable already uses.

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, CircularProgress, Box } from "@mui/material";
import { Pencil, RotateCw, Trash2 } from "lucide-react";

import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { CampaignStatsPanel } from "./CampaignStatsPanel";
import { useCampaignDetail, useUpdateCampaign, useDeleteCampaign } from "@/lib/hooks/useCampaigns";
import {
  CAMPAIGN_STATUS,
  canDeleteCampaign,
  canEditCampaign,
  canResendCampaign,
  campaignDeleteBlockedReason,
} from "@/lib/constants/campaign-status";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useState } from "react";

export default function CampaignDetailClient() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params.id);

  const { data, isLoading, isError } = useCampaignDetail(campaignId);
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const campaign = data?.data ?? null;
  const isDraft = campaign?.status === CAMPAIGN_STATUS.DRAFT;

  // A draft is not a record to read, it is work in progress.
  useEffect(() => {
    if (isDraft) router.replace(`/email-marketing/campaigns/${campaignId}/edit`);
  }, [isDraft, campaignId, router]);

  const handleResend = async () => {
    if (!campaign) return;
    try {
      await updateMutation.mutateAsync({ campaignId, data: { action: "send" } });
      notify.success(`Campaign "${campaign.subject}" has been queued for resending.`);
    } catch (err: any) {
      notify.error(handleError(err, "Resend Campaign"));
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await deleteMutation.mutateAsync(campaignId);
      notify.success(`Campaign "${campaign.subject}" deleted.`);
      router.push("/email-marketing/campaigns");
    } catch (err: any) {
      notify.error(err.message || "Failed to delete campaign.");
    } finally {
      setConfirmDelete(false);
    }
  };

  const crumbs = [
    { label: "Email Marketing", href: "/email-marketing" },
    { label: "Campaigns", href: "/email-marketing/campaigns" },
    { label: campaign?.subject ?? "Campaign" },
  ];

  if (isError) {
    return (
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <PageHeader title="Campaign" breadcrumbs={crumbs} />
        <Alert
          severity="error"
          action={
            <AppButton variantStyle="outline" onClick={() => router.push("/email-marketing/campaigns")}>
              Back to Campaigns
            </AppButton>
          }
        >
          We could not load this campaign.
        </Alert>
      </div>
    );
  }

  if (isLoading || !campaign || isDraft) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title={campaign.subject}
        description={`${campaign.status} · ${(campaign.total_target ?? 0).toLocaleString()} recipients`}
        breadcrumbs={crumbs}
        actions={
          <>
            {canResendCampaign(campaign.status) && (
              <AppButton
                variantStyle="outline"
                startIcon={<RotateCw size={16} />}
                onClick={handleResend}
                isLoading={updateMutation.isPending}
              >
                Resend
              </AppButton>
            )}
            {canEditCampaign(campaign.status) && (
              <AppButton
                variantStyle="outline"
                startIcon={<Pencil size={16} />}
                onClick={() => router.push(`/email-marketing/campaigns/${campaignId}/edit`)}
              >
                Edit
              </AppButton>
            )}
            <AppButton
              variantStyle="danger"
              startIcon={<Trash2 size={16} />}
              disabled={!canDeleteCampaign(campaign.status)}
              title={campaignDeleteBlockedReason(campaign.status)}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </AppButton>
          </>
        }
      />

      {/* The PageHeader already names the record, so the panel does not
          repeat it — it keeps only its refresh control. */}
      <CampaignStatsPanel campaign={campaign} height="auto" showHeading={false} headerActions={null} />

      <ConfirmationPopup
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        description={
          <>
            Delete <strong>&quot;{campaign.subject}&quot;</strong>? It has already been sent, so its
            delivery and open statistics go with it. This cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

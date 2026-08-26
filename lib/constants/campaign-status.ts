// lib/constants/campaign-status.ts
//
// Single source of truth for campaign status handling.
//
// These strings are the exact values of the API's `CampaignStatus` StrEnum
// (app/models/campaign_model.py) — including the space in "In Queue". Ad-hoc
// `status.toLowerCase() === 'in_queue'` comparisons never matched it, which is
// how In Queue campaigns ended up with Edit and Delete permanently disabled
// under a tooltip that promised the opposite.
//
// The capability helpers below mirror the API's own guards
// (campaign_service.py) so the UI can't be stricter — or looser — than the
// server it talks to.

export const CAMPAIGN_STATUS = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  IN_QUEUE: 'In Queue',
  PROCESSING: 'Processing',
  FAILED: 'Failed',
  STOPPED: 'Stopped',
} as const;

export type CampaignStatusValue =
  (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

/** Every value, in the order they make sense in a filter dropdown. */
export const CAMPAIGN_STATUS_OPTIONS: CampaignStatusValue[] = [
  CAMPAIGN_STATUS.DRAFT,
  CAMPAIGN_STATUS.IN_QUEUE,
  CAMPAIGN_STATUS.PROCESSING,
  CAMPAIGN_STATUS.SENT,
  CAMPAIGN_STATUS.FAILED,
  CAMPAIGN_STATUS.STOPPED,
];

type ChipColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

export const CAMPAIGN_STATUS_CHIP: Record<CampaignStatusValue, ChipColor> = {
  [CAMPAIGN_STATUS.DRAFT]: 'default',
  [CAMPAIGN_STATUS.IN_QUEUE]: 'info',
  [CAMPAIGN_STATUS.PROCESSING]: 'primary',
  [CAMPAIGN_STATUS.SENT]: 'success',
  [CAMPAIGN_STATUS.FAILED]: 'error',
  [CAMPAIGN_STATUS.STOPPED]: 'warning',
};

/** Tolerant lookup: unknown values keep their raw label and a neutral chip. */
export function campaignStatusChipColor(status: string): ChipColor {
  return CAMPAIGN_STATUS_CHIP[status as CampaignStatusValue] ?? 'default';
}

// ── Capabilities, mirroring the API ────────────────────────────────────────

/** API: `status not in (DRAFT, FAILED)` → 400. Failed campaigns ARE editable. */
export function canEditCampaign(status: string): boolean {
  return status === CAMPAIGN_STATUS.DRAFT || status === CAMPAIGN_STATUS.FAILED;
}

/** API: deletion is refused only while the send is still in flight. */
export function canDeleteCampaign(status: string): boolean {
  return (
    status !== CAMPAIGN_STATUS.IN_QUEUE && status !== CAMPAIGN_STATUS.PROCESSING
  );
}

/** API: `action: 'stop'` requires STOPPABLE_CAMPAIGN_STATUSES. */
export function canStopCampaign(status: string): boolean {
  return (
    status === CAMPAIGN_STATUS.IN_QUEUE || status === CAMPAIGN_STATUS.PROCESSING
  );
}

/** Re-sending goes through the same update guard, so it needs Failed. */
export function canResendCampaign(status: string): boolean {
  return status === CAMPAIGN_STATUS.FAILED;
}

/** Deleting one of these throws away delivery history along with the row. */
export function deletingLosesHistory(status: string): boolean {
  return status === CAMPAIGN_STATUS.SENT || status === CAMPAIGN_STATUS.STOPPED;
}

export function campaignDeleteBlockedReason(status: string): string | undefined {
  return canDeleteCampaign(status)
    ? undefined
    : 'Stop the campaign before deleting it';
}

export function campaignEditBlockedReason(status: string): string | undefined {
  return canEditCampaign(status)
    ? undefined
    : 'Only Draft and Failed campaigns can be edited';
}

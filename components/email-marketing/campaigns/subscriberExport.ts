// components/email-marketing/campaigns/subscriberExport.ts
//
// What the stats cards in CampaignStatsPanel export: every subscriber the
// card counts, as a CSV or Excel file. The API's status filter is cumulative,
// like the cards, so Delivered also holds those who opened or clicked, and
// Bounced also holds the failed. Bounced adds why each one bounced.

import { format } from 'date-fns';

import {
  exportFileName,
  statusLabel,
  type ExportColumn,
  type ExportFileFormat,
} from '@/lib/utils/exportRows';
import type { CampaignSubscriber } from '@/lib/types/email-marketing';

/** The cards that export their subscribers. */
export const EXPORTABLE_SUBSCRIBER_STATUSES = ['delivered', 'opened', 'clicked', 'bounced'] as const;
export type ExportableSubscriberStatus = (typeof EXPORTABLE_SUBSCRIBER_STATUSES)[number];

// The subscribers table's own columns first, then the contact details. Dates
// as `yyyy-MM-dd HH:mm`, like the WhatsApp export.
export const SUBSCRIBER_EXPORT_COLUMNS: ExportColumn<CampaignSubscriber>[] = [
  { header: 'Name', value: (s) => s.name },
  { header: 'Email', value: (s) => s.email },
  { header: 'Status', value: (s) => (s.status ? statusLabel(s.status) : '') },
  { header: 'Phone Number', value: (s) => s.phone_number },
  { header: 'Company', value: (s) => s.company },
  {
    header: 'Updated At',
    value: (s) => (s.updated_at ? format(new Date(s.updated_at), 'yyyy-MM-dd HH:mm') : ''),
  },
];

/** The columns of one card's file: Bounced adds the last error the API sent. */
export function subscriberExportColumns(status: ExportableSubscriberStatus): ExportColumn<CampaignSubscriber>[] {
  if (status !== 'bounced') return SUBSCRIBER_EXPORT_COLUMNS;
  return [...SUBSCRIBER_EXPORT_COLUMNS, { header: 'Error Message', value: (s) => s.error_message }];
}

/** e.g. `Campaign_Promo_Oktober_Delivered_2026-10-28.xlsx` (named after the subject). */
export function subscriberExportFileName(
  subject: string,
  status: ExportableSubscriberStatus,
  fileFormat: ExportFileFormat,
  date = new Date()
) {
  return exportFileName('Campaign', subject, statusLabel(status), fileFormat, date);
}

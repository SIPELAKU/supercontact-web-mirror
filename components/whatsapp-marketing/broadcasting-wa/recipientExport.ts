// components/whatsapp-marketing/broadcasting-wa/recipientExport.ts
//
// What the stats cards in ViewBroadcastStatsModal export: every recipient the
// card counts, as a CSV or Excel file. The API's status filter is cumulative,
// like the cards, so Sent also holds those that were delivered or read.
// Failed adds why each one failed.

import { format } from 'date-fns';

import {
  exportFileName,
  statusLabel,
  type ExportColumn,
  type ExportFileFormat,
} from '@/lib/utils/exportRows';
import type { BroadcastRecipient } from '@/lib/types/whatsapp-marketing';

/** The cards that export their recipients: all four. */
export const EXPORTABLE_STATUSES = ['sent', 'delivered', 'read', 'failed'] as const;
export type ExportableStatus = (typeof EXPORTABLE_STATUSES)[number];

// Shared with the other exports; kept importable from here.
export { statusLabel };

// The recipients table's own columns first, in its order, then the extra
// details. Dates as `yyyy-MM-dd HH:mm`: unambiguous, and they sort correctly
// even where a spreadsheet keeps them as text.
export const RECIPIENT_EXPORT_COLUMNS: ExportColumn<BroadcastRecipient>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Phone Number', value: (r) => r.phone_number },
  { header: 'Status', value: (r) => (r.status ? statusLabel(r.status) : '') },
  { header: 'Email', value: (r) => r.email },
  { header: 'Company', value: (r) => r.company },
  {
    header: 'Updated At',
    value: (r) => (r.updated_at ? format(new Date(r.updated_at), 'yyyy-MM-dd HH:mm') : ''),
  },
];

/** The columns of one card's file: Failed adds the last error the API sent. */
export function recipientExportColumns(status: ExportableStatus): ExportColumn<BroadcastRecipient>[] {
  if (status !== 'failed') return RECIPIENT_EXPORT_COLUMNS;
  return [...RECIPIENT_EXPORT_COLUMNS, { header: 'Error Message', value: (r) => r.error_message }];
}

/** e.g. `Broadcast_Promo_Oktober_Sent_2026-10-24.xlsx` */
export function recipientExportFileName(
  broadcastName: string,
  status: string,
  fileFormat: ExportFileFormat,
  date = new Date()
) {
  return exportFileName('Broadcast', broadcastName, statusLabel(status), fileFormat, date);
}

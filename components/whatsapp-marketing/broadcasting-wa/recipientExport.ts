// components/whatsapp-marketing/broadcasting-wa/recipientExport.ts
//
// What the stats cards in ViewBroadcastStatsModal export: every recipient of
// the broadcast whose latest status matches the card, as a CSV or Excel file.

import { format } from 'date-fns';

import {
  EXPORT_FILE_EXTENSION,
  type ExportColumn,
  type ExportFileFormat,
} from '@/lib/utils/exportRows';
import type { BroadcastRecipient } from '@/lib/types/whatsapp-marketing';

/** The cards that export their recipients. Failed deliberately does not. */
export const EXPORTABLE_STATUSES = ['sent', 'delivered', 'read'] as const;
export type ExportableStatus = (typeof EXPORTABLE_STATUSES)[number];

export const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

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

/** e.g. `Broadcast_Promo_Oktober_Sent_2026-10-24.xlsx` */
export function recipientExportFileName(
  broadcastName: string,
  status: string,
  fileFormat: ExportFileFormat,
  date = new Date()
) {
  const name = broadcastName.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Untitled';
  return `Broadcast_${name}_${statusLabel(status)}_${format(date, 'yyyy-MM-dd')}.${EXPORT_FILE_EXTENSION[fileFormat]}`;
}

import { describe, expect, it } from 'vitest';

import { toRows } from '@/lib/utils/exportRows';
import type { BroadcastRecipient } from '@/lib/types/whatsapp-marketing';
import {
  EXPORTABLE_STATUSES,
  RECIPIENT_EXPORT_COLUMNS,
  recipientExportFileName,
  statusLabel,
} from './recipientExport';

const recipient = (overrides: Partial<BroadcastRecipient> = {}): BroadcastRecipient =>
  ({
    id: 'r1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone_number: '6281234567890',
    position: 'Manager',
    company: 'PT Maju',
    address: 'Jakarta',
    recipient_type: 'whatsapp',
    custom_fields: {},
    created_at: '2026-10-01T08:00:00',
    updated_at: '2026-10-24T09:30:00',
    status: 'delivered',
    ...overrides,
  }) as BroadcastRecipient;

describe('recipient export', () => {
  it('exports Sent, Delivered and Read - not Failed', () => {
    expect(EXPORTABLE_STATUSES).toEqual(['sent', 'delivered', 'read']);
  });

  it('starts with the recipients table columns in its order, then the extra details', () => {
    expect(toRows(RECIPIENT_EXPORT_COLUMNS, [recipient()])).toEqual([
      ['Name', 'Phone Number', 'Status', 'Email', 'Company', 'Updated At'],
      ['Budi Santoso', '6281234567890', 'Delivered', 'budi@example.com', 'PT Maju', '2026-10-24 09:30'],
    ]);
  });

  it('leaves missing values empty instead of writing "null" or failing on the date', () => {
    const row = toRows(RECIPIENT_EXPORT_COLUMNS, [
      recipient({ name: null as unknown as string, email: null as unknown as string, updated_at: '' }),
    ])[1];
    expect(row).toEqual(['', '6281234567890', 'Delivered', '', 'PT Maju', '']);
  });

  it('names the file after the broadcast, the status and the day, with the format extension', () => {
    const day = new Date(2026, 9, 24);
    expect(recipientExportFileName('Promo Oktober', 'sent', 'csv', day)).toBe('Broadcast_Promo_Oktober_Sent_2026-10-24.csv');
    expect(recipientExportFileName('Promo Oktober', 'sent', 'excel', day)).toBe('Broadcast_Promo_Oktober_Sent_2026-10-24.xlsx');
    expect(recipientExportFileName('  Diskon 50%! (VIP) ', 'read', 'excel', day)).toBe('Broadcast_Diskon_50_VIP_Read_2026-10-24.xlsx');
    expect(recipientExportFileName('***', 'delivered', 'csv', day)).toBe('Broadcast_Untitled_Delivered_2026-10-24.csv');
  });

  it('labels statuses with a capital first letter', () => {
    expect(statusLabel('sent')).toBe('Sent');
  });
});

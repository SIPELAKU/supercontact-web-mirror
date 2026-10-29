import { describe, expect, it } from 'vitest';

import { toRows } from '@/lib/utils/exportRows';
import type { CampaignSubscriber } from '@/lib/types/email-marketing';
import {
  EXPORTABLE_SUBSCRIBER_STATUSES,
  SUBSCRIBER_EXPORT_COLUMNS,
  subscriberExportColumns,
  subscriberExportFileName,
} from './subscriberExport';

const subscriber = (overrides: Partial<CampaignSubscriber> = {}): CampaignSubscriber =>
  ({
    id: 's1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone_number: '6281234567890',
    position: 'Manager',
    company: 'PT Maju',
    address: 'Jakarta',
    is_subscribed: true,
    created_at: '2026-10-01T08:00:00',
    updated_at: '2026-10-28T09:30:00',
    status: 'opened',
    error_message: null,
    ...overrides,
  }) as CampaignSubscriber;

describe('campaign subscriber export', () => {
  it('exports the Delivered, Opened, Clicked and Bounced cards', () => {
    expect(EXPORTABLE_SUBSCRIBER_STATUSES).toEqual(['delivered', 'opened', 'clicked', 'bounced']);
  });

  it('writes name, email, status, phone, company and last update', () => {
    expect(toRows(SUBSCRIBER_EXPORT_COLUMNS, [subscriber()])).toEqual([
      ['Name', 'Email', 'Status', 'Phone Number', 'Company', 'Updated At'],
      ['Budi Santoso', 'budi@example.com', 'Opened', '6281234567890', 'PT Maju', '2026-10-28 09:30'],
    ]);
  });

  it('adds why each one bounced to the Bounced file only', () => {
    const bounced = subscriber({ status: 'bounced', error_message: 'Mailbox does not exist' });

    expect(toRows(subscriberExportColumns('bounced'), [bounced])[0].at(-1)).toBe('Error Message');
    expect(toRows(subscriberExportColumns('bounced'), [bounced])[1].at(-1)).toBe('Mailbox does not exist');
    for (const status of ['delivered', 'opened', 'clicked'] as const) {
      expect(subscriberExportColumns(status)).toBe(SUBSCRIBER_EXPORT_COLUMNS);
    }
  });

  it('leaves missing values and errors empty', () => {
    const row = toRows(subscriberExportColumns('bounced'), [
      subscriber({ name: null as unknown as string, updated_at: '', status: 'bounced', error_message: null }),
    ])[1];
    expect(row).toEqual(['', 'budi@example.com', 'Bounced', '6281234567890', 'PT Maju', '', '']);
  });

  it('names the file after the campaign subject, the status and the day', () => {
    const day = new Date(2026, 9, 28);
    expect(subscriberExportFileName('Promo Oktober!', 'delivered', 'excel', day)).toBe(
      'Campaign_Promo_Oktober_Delivered_2026-10-28.xlsx'
    );
    expect(subscriberExportFileName('', 'bounced', 'csv', day)).toBe('Campaign_Untitled_Bounced_2026-10-28.csv');
  });
});

import { describe, expect, it } from 'vitest';

import type { BroadcastTemplateApprovalStatus } from '@/lib/types/whatsapp-marketing';
import { bulkDeleteBlockReason, isDeletableTemplate } from './templateDeletion';

const template = (whatsapp_approval_status: BroadcastTemplateApprovalStatus) => ({ whatsapp_approval_status });

describe('template deletion', () => {
  it('blocks deleting an Approved template', () => {
    expect(isDeletableTemplate(template('Approved'))).toBe(false);
  });

  it('allows deleting templates in every other approval state', () => {
    const others: BroadcastTemplateApprovalStatus[] = ['Not submitted', 'Received', 'Pending', 'Rejected', 'Paused', 'Disabled'];
    for (const status of others) expect(isDeletableTemplate(template(status))).toBe(true);
  });

  it('bulk delete: allowed when nothing selected is Approved', () => {
    expect(bulkDeleteBlockReason([template('Pending'), template('Rejected')])).toBeNull();
  });

  it('bulk delete: blocked, with a count, when any selected template is Approved', () => {
    expect(bulkDeleteBlockReason([template('Approved'), template('Pending')])).toBe(
      '1 selected template is approved and cannot be deleted. Unselect it to delete the rest.'
    );
    expect(bulkDeleteBlockReason([template('Approved'), template('Approved'), template('Rejected')])).toBe(
      '2 selected templates are approved and cannot be deleted. Unselect them to delete the rest.'
    );
  });
});

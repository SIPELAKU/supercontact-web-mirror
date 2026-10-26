// components/whatsapp-marketing/templates/templateDeletion.ts
//
// Which templates the list lets you delete. An Approved template is live on
// WhatsApp and may be used by broadcasts, so it cannot be deleted from here.

import type { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';

type WithApproval = Pick<BroadcastTemplate, 'whatsapp_approval_status'>;

export const APPROVED_DELETE_REASON = 'Approved templates cannot be deleted';

export const isDeletableTemplate = (template: WithApproval) =>
  template.whatsapp_approval_status !== 'Approved';

/** Why a bulk delete of `rows` is blocked, or null when it is not. */
export function bulkDeleteBlockReason(rows: WithApproval[]): string | null {
  const approved = rows.filter((row) => !isDeletableTemplate(row)).length;
  if (approved === 0) return null;
  return approved === 1
    ? '1 selected template is approved and cannot be deleted. Unselect it to delete the rest.'
    : `${approved} selected templates are approved and cannot be deleted. Unselect them to delete the rest.`;
}

import { describe, expect, it } from 'vitest';
import type { DealLead } from '@/lib/api/pipelines';
import { toLeadOption } from './dealLeadOptions';

const lead = (patch: Partial<DealLead> = {}): DealLead => ({
  id: 'lead-1',
  contact_id: 'contact-1',
  assigned_to: 'user-1',
  lead_status: 'Qualified',
  created_at: '2026-10-26T00:00:00Z',
  contact: { id: 'contact-1', name: 'Budi Lestari', company: 'PT Maju' },
  user: { id: 'user-1', fullname: 'Sari' },
  ...patch,
});

describe('toLeadOption', () => {
  it('maps a lead to its client, its assignee and the lead id', () => {
    expect(toLeadOption(lead())).toEqual({
      value: 'lead-1',
      label: 'Budi Lestari',
      detail: 'Qualified · Assigned to Sari',
      contactId: 'contact-1',
      assignedTo: 'user-1',
      assigneeName: 'Sari',
    });
  });

  it('tells apart two leads of the same client by status and assignee', () => {
    const a = toLeadOption(lead({ id: 'lead-a', lead_status: 'Contacted', user: { id: 'u1', fullname: 'Sari' } }));
    const b = toLeadOption(lead({ id: 'lead-b', lead_status: 'Qualified', user: { id: 'u2', fullname: 'Andi' } }));

    expect(a.label).toBe(b.label);
    expect(a.value).not.toBe(b.value);
    expect(a.detail).not.toBe(b.detail);
  });

  it('falls back to the company, then a placeholder, when the contact has no name', () => {
    expect(toLeadOption(lead({ contact: { id: 'c', name: '', company: 'PT Maju' } })).label).toBe('PT Maju');
    expect(toLeadOption(lead({ contact: null })).label).toBe('Unnamed client');
  });

  it('leaves the assignee empty when the lead has none', () => {
    const option = toLeadOption(lead({ assigned_to: '', user: null }));
    expect(option.assignedTo).toBe('');
    expect(option.detail).toBe('Qualified');
  });
});

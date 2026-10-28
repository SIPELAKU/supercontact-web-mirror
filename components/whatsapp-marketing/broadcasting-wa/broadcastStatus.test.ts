import { describe, expect, it } from 'vitest';
import { broadcastStatusChip } from './broadcastStatus';

describe('broadcastStatusChip (same colour in the list and the stats modal)', () => {
  it('colours each API status', () => {
    expect(broadcastStatusChip('Draft')).toEqual({ label: 'Draft', color: 'default' });
    expect(broadcastStatusChip('In Queue')).toEqual({ label: 'In Queue', color: 'warning' });
    expect(broadcastStatusChip('Sent')).toEqual({ label: 'Sent', color: 'success' });
    expect(broadcastStatusChip('Failed')).toEqual({ label: 'Failed', color: 'error' });
  });

  it('ignores case and spaces around the value', () => {
    expect(broadcastStatusChip(' sent ')).toEqual({ label: 'Sent', color: 'success' });
    expect(broadcastStatusChip('IN QUEUE')).toEqual({ label: 'In Queue', color: 'warning' });
  });

  it('keeps the older values readable', () => {
    expect(broadcastStatusChip('sending')).toEqual({ label: 'Sending', color: 'primary' });
    expect(broadcastStatusChip('completed')).toEqual({ label: 'Sent', color: 'success' });
  });

  it('shows an unknown or missing status as it is, in grey', () => {
    expect(broadcastStatusChip('Paused')).toEqual({ label: 'Paused', color: 'default' });
    expect(broadcastStatusChip(undefined)).toEqual({ label: '-', color: 'default' });
  });
});

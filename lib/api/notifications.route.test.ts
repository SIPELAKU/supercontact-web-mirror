import { describe, expect, it } from 'vitest';
import { getNotificationRoute, type NotificationData } from './notifications';

// Where clicking a notification goes. A deal notification opens that deal's
// Update Pipeline modal through ?deal=<id> (read by PipelineClient).

const notif = (patch: Partial<NotificationData>): NotificationData =>
  ({ id: 'n1', is_read: false, ...patch }) as NotificationData;

describe('getNotificationRoute', () => {
  it('opens the deal itself for a pipeline notification', () => {
    expect(getNotificationRoute(notif({ entity_type: 'pipeline', entity_id: 'deal-123' }))).toBe(
      '/sales/pipeline?deal=deal-123'
    );
  });

  it('falls back to the board when a pipeline notification has no deal id', () => {
    expect(getNotificationRoute(notif({ entity_type: 'pipeline' }))).toBe('/sales/pipeline');
  });

  it('leaves the other entity types as they were', () => {
    expect(getNotificationRoute(notif({ entity_type: 'lead', entity_id: 'lead-1' }))).toBe('/lead-management');
    expect(getNotificationRoute(notif({ entity_type: 'omnichannel_conversation', entity_id: 'c1' }))).toBe(
      '/omnichannel?conversation=c1'
    );
    expect(getNotificationRoute(notif({ entity_type: 'task', entity_id: 't1' }))).toBeNull();
  });
});

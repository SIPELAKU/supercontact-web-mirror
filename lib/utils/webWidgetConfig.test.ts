import { describe, expect, it } from 'vitest';

import type { UpdateWebWidgetConfigRequest, WebWidgetConfig } from '@/lib/types/omnichannel';
import { widgetConfigPayload } from './webWidgetConfig';

/** A stored config as GET returns it, with the two fields no form shows switched on. */
const stored = {
  id: 'cfg-1',
  account_id: 'acc-1',
  title: 'Chat with us',
  greeting_message: 'Hi!',
  brand_color: '#5479EE',
  allowed_domains: ['example.com'],
  answer_bot_enabled: false,
  answer_bot_shadow: true,
  allow_native_apps: true,
} as WebWidgetConfig;

describe('widgetConfigPayload', () => {
  it("keeps the stored fields the Settings form doesn't have (Shadow mode, native apps)", () => {
    // The Settings panel sends its whole form, which has neither field.
    const form = { title: 'Chat with us 2', greeting_message: 'Hi!', brand_color: '#000000', allowed_domains: [] };
    const body = widgetConfigPayload(stored, form);
    expect(body.answer_bot_shadow).toBe(true);
    expect(body.allow_native_apps).toBe(true);
  });

  it('the changes win over the stored values', () => {
    const body = widgetConfigPayload(stored, { title: 'New title', allowed_domains: [], answer_bot_shadow: false });
    expect(body.title).toBe('New title');
    expect(body.allowed_domains).toEqual([]);
    expect(body.answer_bot_shadow).toBe(false);
    expect(body.greeting_message).toBe('Hi!');
  });

  it('leaves out id and account_id, which are not part of the PUT body', () => {
    const body = widgetConfigPayload(stored, {});
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('account_id');
  });

  it('no stored config yet: just the changes', () => {
    const changes: Partial<UpdateWebWidgetConfigRequest> = { title: 'Only this' };
    expect(widgetConfigPayload(undefined, changes)).toEqual({ title: 'Only this' });
  });
});

import { describe, it, expect } from 'vitest';
import { resolveWaAccountId, templatesListHref } from './useSelectedWaAccount';

/**
 * The sender scope used to live in `useState('')` and reset on every Back
 * navigation, leaving the template list empty behind an unselected dropdown.
 * These pin the resolution ORDER that replaced it: URL, then remembered, then
 * the first account - and never blank while any account exists.
 */
const ACCOUNTS = [{ id: 'acc-one' }, { id: 'acc-two' }];

describe('resolveWaAccountId', () => {
  it('prefers the URL when it names a known account', () => {
    expect(resolveWaAccountId(ACCOUNTS, 'acc-two', 'acc-one')).toBe('acc-two');
  });

  it('falls back to the remembered account when the URL is empty', () => {
    expect(resolveWaAccountId(ACCOUNTS, '', 'acc-two')).toBe('acc-two');
  });

  it('falls back to the first account when nothing is known - never blank', () => {
    expect(resolveWaAccountId(ACCOUNTS, '', '')).toBe('acc-one');
  });

  it('ignores a URL id for an account that no longer exists', () => {
    // A stale shared link or a deactivated sender must not empty the table.
    expect(resolveWaAccountId(ACCOUNTS, 'acc-deleted', 'acc-two')).toBe('acc-two');
    expect(resolveWaAccountId(ACCOUNTS, 'acc-deleted', '')).toBe('acc-one');
  });

  it('ignores a remembered id that is no longer valid', () => {
    expect(resolveWaAccountId(ACCOUNTS, '', 'acc-gone')).toBe('acc-one');
  });

  it('is blank only when there are no accounts at all', () => {
    expect(resolveWaAccountId([], 'acc-one', 'acc-one')).toBe('');
  });
});

describe('templatesListHref', () => {
  it('scopes the list to a sender, URL-encoded', () => {
    expect(templatesListHref('acc one')).toBe(
      '/whatsapp-marketing/template-broadcasting?account=acc%20one'
    );
  });

  it('returns the bare list when there is no sender to carry', () => {
    expect(templatesListHref(undefined)).toBe('/whatsapp-marketing/template-broadcasting');
    expect(templatesListHref('')).toBe('/whatsapp-marketing/template-broadcasting');
  });
});

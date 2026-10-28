import { describe, expect, it } from 'vitest';
import { LOGO_ACCEPT, LOGO_MAX_BYTES, logoFileError } from './companyLogo';

const file = (name: string, type: string, size = 1024) => ({ name, type, size });

describe('logoFileError (the rules of POST /internal/company-profile/logo)', () => {
  it('accepts JPG, PNG, GIF and WebP', () => {
    for (const [name, type] of [['a.jpg', 'image/jpeg'], ['a.png', 'image/png'], ['a.gif', 'image/gif'], ['a.webp', 'image/webp']]) {
      expect(logoFileError(file(name, type))).toBeNull();
    }
    expect(LOGO_ACCEPT).toBe('image/jpeg,image/png,image/gif,image/webp');
  });

  it('rejects other files, SVG included', () => {
    expect(logoFileError(file('logo.svg', 'image/svg+xml'))).toBe('Use a JPG, PNG, GIF or WebP image.');
    expect(logoFileError(file('profile.pdf', 'application/pdf'))).toBe('Use a JPG, PNG, GIF or WebP image.');
  });

  it('allows up to 10 MB and no more', () => {
    expect(logoFileError(file('a.png', 'image/png', LOGO_MAX_BYTES))).toBeNull();
    expect(logoFileError(file('a.png', 'image/png', LOGO_MAX_BYTES + 1))).toBe('The logo must be 10 MB or smaller.');
  });

  it('goes by the extension when the system gives no file type', () => {
    expect(logoFileError(file('Logo.PNG', ''))).toBeNull();
    expect(logoFileError(file('logo.svg', ''))).toBe('Use a JPG, PNG, GIF or WebP image.');
  });
});

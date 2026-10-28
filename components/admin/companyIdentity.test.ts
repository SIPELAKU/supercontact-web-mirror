import { describe, expect, it } from 'vitest';
import { companyInitials, websiteHref, websiteLabel } from './companyIdentity';

describe('companyInitials (monogram when there is no logo)', () => {
  it('takes the first letters of the first two words', () => {
    expect(companyInitials('Solvera Global Teknologi')).toBe('SG');
    expect(companyInitials('smartsales')).toBe('S');
  });

  it('skips legal forms such as PT, CV and Tbk', () => {
    expect(companyInitials('PT Solvera Global Teknologi')).toBe('SG');
    expect(companyInitials('CV. Maju Jaya')).toBe('MJ');
    expect(companyInitials('PT Bank Rakyat Tbk')).toBe('BR');
  });

  it('keeps a name made only of a legal form readable, and never returns nothing', () => {
    expect(companyInitials('PT')).toBe('P');
    expect(companyInitials('  ')).toBe('?');
    expect(companyInitials(undefined)).toBe('?');
  });
});

describe('website link and label', () => {
  it('adds https:// to a website saved without a scheme', () => {
    expect(websiteHref('solvera.id')).toBe('https://solvera.id');
    expect(websiteHref(' http://solvera.id ')).toBe('http://solvera.id');
    expect(websiteHref('HTTPS://solvera.id')).toBe('HTTPS://solvera.id');
  });

  it('shows the website without scheme, www. or trailing slash', () => {
    expect(websiteLabel('https://www.solvera.id/')).toBe('solvera.id');
    expect(websiteLabel('solvera.id/about')).toBe('solvera.id/about');
  });
});

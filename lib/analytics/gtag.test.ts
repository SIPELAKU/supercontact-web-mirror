import { describe, expect, it } from 'vitest';

import { redactAnalyticsPath } from './gtag';

// The public quotation code and the CSAT token are BEARER CREDENTIALS on
// deliberately unauthenticated routes, and production mints those links on
// `https://smartsales.id` - the one host `analyticsAllowedOnHost()` allows.
// Sending either to GA4 as page_path / page_location hands anyone with read
// access to the property the ability to open a tenant's private quotation and
// accept it in their customer's name.
describe('redactAnalyticsPath', () => {
    it('replaces the quotation acceptance code', () => {
        expect(redactAnalyticsPath('/q/AbCdEfGhIjKlMnOpQrStUv')).toBe('/q/[code]');
    });

    it('keeps anything that follows the code', () => {
        expect(redactAnalyticsPath('/q/AbCdEfGhIjKlMnOpQrStUv/thanks')).toBe('/q/[code]/thanks');
    });

    it('replaces the CSAT survey token', () => {
        expect(redactAnalyticsPath(`/csat/${'t'.repeat(43)}`)).toBe('/csat/[token]');
    });

    it('leaves the lead-magnet id alone - a campaign link is published on purpose', () => {
        expect(redactAnalyticsPath('/m/spring-promo')).toBe('/m/spring-promo');
    });

    it('passes ordinary marketing paths through byte for byte', () => {
        expect(redactAnalyticsPath('/')).toBe('/');
        expect(redactAnalyticsPath('/harga')).toBe('/harga');
        expect(redactAnalyticsPath('/blog/quotation-terbaik')).toBe('/blog/quotation-terbaik');
    });

    it('does not match a route that merely starts with the same letters', () => {
        expect(redactAnalyticsPath('/quotation')).toBe('/quotation');
        expect(redactAnalyticsPath('/q')).toBe('/q');
    });
});

import { gtagEvent } from './gtag';

// Canonical marketing-funnel event schema (see lib/analytics/README.md):
//   page_view → cta_click / whatsapp_click → sign_up
// `generate_lead` is RESERVED for actual lead captures (e.g. smart-capture
// magnet submits) and must never fire on generic CTA clicks — it previously
// did, which would have poisoned Google Ads Smart Bidding had it been
// imported as a conversion. Renamed 2026-08-31 (annotate in GA4).

/** Fire on any generic marketing CTA click (register buttons, learn-more, …). */
export function trackCtaClick(source: string, label: string): void {
    gtagEvent({
        action: 'cta_click',
        category: 'cta',
        label,
        source,
    });
}

/**
 * Fire when a visitor clicks through to WhatsApp — the dominant contact
 * channel for Indonesian B2B buyers and a Google Ads conversion signal
 * (imported from GA4 as a secondary conversion). Only call this on clicks
 * that actually open wa.me.
 */
export function trackWhatsAppClick(source: string, label: string): void {
    gtagEvent({
        action: 'whatsapp_click',
        category: 'contact',
        label,
        source,
    });
}

/** Fire on successful account registration — the strongest conversion signal on the site. */
export function trackSignUp(method: string = 'email'): void {
    gtagEvent({
        action: 'sign_up',
        category: 'conversion',
        label: method,
        method,
    });
}

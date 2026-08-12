import { gtagEvent } from './gtag';

/**
 * Fire when a visitor clicks a WhatsApp/contact-sales CTA — the site's
 * primary conversion action. Uses GA4's recommended `generate_lead` event
 * so it surfaces in GA4's built-in conversion reporting without extra config.
 */
export function trackCtaClick(source: string, label: string): void {
    gtagEvent({
        action: 'generate_lead',
        category: 'cta',
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

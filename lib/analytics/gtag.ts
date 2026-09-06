export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google Ads (AW-…) tag + the conversion label for "Registration completed".
// Both unset => all Ads calls are inert (same pattern as GA_MEASUREMENT_ID).
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
export const GOOGLE_ADS_REGISTER_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_REGISTER_LABEL;

// Hosts where analytics is allowed to load. Production serves on the APEX
// (www 308-redirects to it — verified 2026-08-31); www is kept in the list
// so the tag still fires for any user who lands mid-redirect. dev/staging
// subdomains and *.vercel.app previews must never ship real hits: if one of
// them ever gets NEXT_PUBLIC_GA_ID set at build, this guard is what stops
// test registrations from polluting GA4/Ads conversions.
const ANALYTICS_HOSTS = ['smartsales.id', 'www.smartsales.id'];

export function analyticsAllowedOnHost(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    if (ANALYTICS_HOSTS.includes(window.location.hostname)) {
        return true;
    }
    // Local debugging opt-in only — never set this in any deployed env.
    return process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';
}

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

// Routes whose first path segment IS a bearer credential, and the label that
// replaces it. `/q/<public_code>` is the public quotation acceptance page and
// `/csat/<token>` the public survey: both are deliberately unauthenticated, so
// the opaque string in the URL is the ONLY authority. Sending it to GA4 hands
// every reader of the property (staff, a marketing contractor, any linked
// Google account) a working credential — for /q that means reading a tenant's
// private commercial document and accepting it in the customer's name, which
// also moves the linked deal to the winning stage and cannot be undone.
// Production mints those links on `https://smartsales.id`, which is exactly
// the host `analyticsAllowedOnHost()` allows, so this is not hypothetical.
//
// `/m/<id>` is deliberately NOT in this list: a lead-magnet link is a campaign
// landing page that is published in ads on purpose, its id is not a secret,
// and collapsing it would delete the per-campaign attribution GA4 is being
// used for.
const CREDENTIAL_PATH_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
    [/^\/q\/[^/]+/, '/q/[code]'],
    [/^\/csat\/[^/]+/, '/csat/[token]'],
];

/** Replace a credential path segment with its route label. Pure; unit-tested. */
export function redactAnalyticsPath(path: string): string {
    for (const [pattern, label] of CREDENTIAL_PATH_PATTERNS) {
        if (pattern.test(path)) {
            return path.replace(pattern, label);
        }
    }
    return path;
}

export function pageview(url: string): void {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) {
        return;
    }
    // Redacted HERE and not only at the call site, so no future caller can
    // reintroduce the leak by passing a raw pathname.
    const queryAt = url.indexOf('?');
    const path = queryAt === -1 ? url : url.slice(0, queryAt);
    const query = queryAt === -1 ? '' : url.slice(queryAt);
    const safe = `${redactAnalyticsPath(path)}${query}`;
    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: safe,
        // page_path alone is not enough: gtag defaults `page_location` to the
        // real `window.location.href` on every event it sends, so the code
        // would still reach GA4 through that field.
        page_location: `${window.location.origin}${safe}`,
    });
}

export interface GtagEventParams {
    action: string;
    category: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

export function gtagEvent({ action, category, label, value, ...rest }: GtagEventParams): void {
    if (typeof window === 'undefined' || !window.gtag) {
        return;
    }
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...rest,
    });
}

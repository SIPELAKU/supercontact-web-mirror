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

export function pageview(url: string): void {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) {
        return;
    }
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
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

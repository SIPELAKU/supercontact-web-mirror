export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

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

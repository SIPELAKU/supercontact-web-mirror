import { GOOGLE_ADS_ID, GOOGLE_ADS_REGISTER_LABEL } from './gtag';

/**
 * Normalize an Indonesian phone number to E.164 (+62…) for Google Ads
 * enhanced conversions. Google hashes the value client-side; it only matches
 * across their graph when formatted E.164.
 */
export function normalizePhoneIdE164(phone: string): string {
    const raw = phone.replace(/[\s-]/g, '');
    const hadPlus = raw.startsWith('+');
    const digits = hadPlus ? raw.slice(1) : raw;
    // A leading 0 is always the local trunk prefix, even when the user typed
    // '+0…' (which the register form's PHONE_REGEX accepts) — E.164 country
    // codes can never start with 0.
    if (digits.startsWith('0')) return `+62${digits.replace(/^0+/, '')}`;
    if (digits.startsWith('62')) return `+${digits}`;
    // '+' with a non-0, non-62 prefix: trust the typed country code.
    return hadPlus ? `+${digits}` : `+62${digits}`;
}

/**
 * Fire the Google Ads "Registration completed" conversion — the PRIMARY
 * bidding signal (the GA4 `sign_up` event stays observation-only in Ads, so
 * there is no double counting; see lib/analytics/README.md).
 *
 * Enhanced conversions: email/phone come from the register form itself and
 * are set via `user_data` for Google to hash on-device. This requires the
 * privacy-policy disclosure that ships with /privacy-policy — do not enable
 * the Ads-side "enhanced conversions" toggle before that page is live.
 *
 * Inert unless NEXT_PUBLIC_GOOGLE_ADS_ID + NEXT_PUBLIC_GOOGLE_ADS_REGISTER_LABEL
 * are set at build, so this is safe to ship ahead of the Ads account.
 */
export function trackAdsRegistration(userData: { email: string; phone?: string }): void {
    if (!GOOGLE_ADS_ID || !GOOGLE_ADS_REGISTER_LABEL) return;
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('set', 'user_data', {
        email: userData.email,
        ...(userData.phone ? { phone_number: normalizePhoneIdE164(userData.phone) } : {}),
    });
    window.gtag('event', 'conversion', {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_REGISTER_LABEL}`,
    });
}

"use client";

import { Suspense, useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID, analyticsAllowedOnHost, pageview } from '@/lib/analytics/gtag';

function PageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;
        const query = searchParams?.toString();
        pageview(query ? `${pathname}?${query}` : pathname);
    }, [pathname, searchParams]);

    return null;
}

export default function GoogleAnalytics() {
    // Host check is client-only, so gate through state to keep SSR/hydration
    // consistent: the server always renders null, the allowed hosts mount the
    // scripts right after hydration (afterInteractive semantics preserved).
    const [allowed, setAllowed] = useState(false);
    useEffect(() => {
        setAllowed(analyticsAllowedOnHost());
    }, []);

    // gtag.js must load when EITHER tag is configured — Ads conversion
    // tracking (trackAdsRegistration) must not silently depend on GA4 being
    // enabled too.
    const loaderId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;
    if (!loaderId || !allowed) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
                strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });` : ''}
                    ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
                    window.gtag = gtag;
                `}
            </Script>
            <Suspense fallback={null}>
                <PageviewTracker />
            </Suspense>
        </>
    );
}

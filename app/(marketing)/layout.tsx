import Script from "next/script";
import MarketingShell from "@/components/layout/MarketingShell";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

// SmartSales dogfoods its own Web Widget on the public marketing site.
// Same-origin bundle (Next serves public/widget.js), data-api-url from the
// per-environment API URL, locale "id". Only rendered on the marketing
// scope (this layout), never in the authenticated app. The widget account
// "Web SmartSales" (company f7141264…) has allowed_domains=[] (allow-all)
// and is_widget_enabled=true, so the Sprint-1 origin enforcement permits it.
// Widget key is env-overridable so staging can point at a staging widget;
// the production key is the default.
const WIDGET_KEY =
    process.env.NEXT_PUBLIC_WIDGET_KEY ||
    "JvwFQ6izkkdTfeOiEypVV2obyEGojC9mr-WeOiATP_0";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>
            <MarketingShell>{children}</MarketingShell>
            {/* Guard on API_URL so an unset env never emits a broken
                data-api-url="" (the widget would console-error and no-op). */}
            {API_URL && (
                <Script
                    src="/widget.js"
                    strategy="afterInteractive"
                    data-widget-key={WIDGET_KEY}
                    data-api-url={API_URL}
                    data-locale="id"
                />
            )}
        </ReactQueryProvider>
    );
}

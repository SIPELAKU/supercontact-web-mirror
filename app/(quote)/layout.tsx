import ReactQueryProvider from "@/lib/ReactQueryProvider";

// Public quotation acceptance route group (/q/[code]).
//
// CRITICAL - TWO THINGS THIS LAYOUT EXISTS TO GET RIGHT:
//
// 1. React-Query providers do NOT cross route-group boundaries, so this group
//    needs its OWN ReactQueryProvider. Omitting it is exactly the prod-only
//    crash that took down every visitor of the /m/[id] lead-magnet pages (a
//    missing QueryClientProvider on a separate route group); the same note
//    lives in app/(survey)/layout.tsx and app/(help)/layout.tsx.
//
// 2. This is a NEUTRAL BRANDED SHELL, deliberately NOT MarketingShell and not
//    the (marketing) group. That layout paints SmartSales' own nav and footer
//    and injects SmartSales' web-widget chat script on every page in the
//    group. This page is a document a TENANT sends to THEIR OWN CUSTOMER: that
//    customer must never be shown our navigation, our footer, or a sales chat
//    widget belonging to the vendor of the software their supplier happens to
//    use. The (survey) group made the same call for the same reason and is
//    the pattern copied here.
//
// No auth of any kind: `middleware.ts` protects only the listed
// PROTECTED_ROUTES_PREFIX, so /q is public by default, and the opaque
// 22-character `public_code` in the URL is the sole authority.
export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-100 via-white to-white px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </ReactQueryProvider>
  );
}

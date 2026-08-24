import ReactQueryProvider from "@/lib/ReactQueryProvider";

// Public Help Center route group.
//
// CRITICAL: React-Query providers do NOT cross route-group boundaries, so this
// group needs its OWN ReactQueryProvider - the (help) pages never mount under
// the (marketing) or (app) providers. Omitting this is exactly the prod-only
// crash that hit the /m/[code] lead-magnet pages (missing QueryClientProvider on
// a separate route group). This is a lightweight branded shell (NOT
// MarketingShell): the per-tenant header/branding lives in HelpShell, applied
// per page from the slug-resolved config.
export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}

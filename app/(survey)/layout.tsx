import ReactQueryProvider from "@/lib/ReactQueryProvider";

// Public CSAT survey route group.
//
// CRITICAL: React-Query providers do NOT cross route-group boundaries, so this
// group needs its OWN ReactQueryProvider - the (survey) pages never mount under
// the (marketing) or (app) providers. Omitting this is exactly the prod-only
// crash that hit the /m/[code] lead-magnet pages (missing QueryClientProvider on
// a separate route group; see the same note in app/(help)/layout.tsx). This is a
// lightweight branded shell (a centered card on a neutral backdrop), NOT
// MarketingShell - a survey recipient must never see SmartSales' own nav/footer.
export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center p-4">
        {children}
      </div>
    </ReactQueryProvider>
  );
}

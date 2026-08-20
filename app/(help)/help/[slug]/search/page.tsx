import type { Metadata } from "next";
import { Suspense } from "react";
import HelpSearchClient from "@/components/help-center/public/HelpSearchClient";
import { HelpLoading } from "@/components/help-center/public/HelpStates";

export const dynamic = "force-dynamic";

// Search results are query-driven, not durable content - keep them out of the
// index but let crawlers follow links back into the (indexable) articles.
export const metadata: Metadata = {
  title: "Search - Help Center",
  robots: { index: false, follow: true },
};

// HelpSearchClient reads useSearchParams(), which must sit under a Suspense
// boundary in the App Router.
export default function HelpSearchPage() {
  return (
    <Suspense fallback={<HelpLoading label="Loading..." />}>
      <HelpSearchClient />
    </Suspense>
  );
}

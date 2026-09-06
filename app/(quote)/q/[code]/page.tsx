import type { Metadata } from "next";
import PublicQuotationClient from "@/components/quotation/public/PublicQuotationClient";

// A quotation acceptance link is a private commercial document addressed to
// one customer - never search content. noindex/nofollow here, and '/q/' is in
// app/robots.ts's DISALLOW as well.
export const metadata: Metadata = {
  title: "Penawaran",
  robots: { index: false, follow: false },
};

// Rendered on demand per code; never prerendered at build (there is no
// generateStaticParams and there must not be one - the codes are secrets).
export const dynamic = "force-dynamic";

// Thin server component -> "use client" child, exactly like
// app/(survey)/csat/[token]/page.tsx. The public fetch happens client-side,
// inside THIS route group's own ReactQueryProvider.
export default function PublicQuotationPage() {
  return <PublicQuotationClient />;
}

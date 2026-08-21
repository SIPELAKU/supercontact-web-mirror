import type { Metadata } from "next";
import CsatSurveyClient from "@/components/csat/CsatSurveyClient";

// A per-survey token link is a private, single-use customer survey - never
// search content. noindex/nofollow (there is no robots.ts allow for /csat/).
export const metadata: Metadata = {
  title: "Customer Satisfaction Survey",
  robots: { index: false, follow: false },
};

// Rendered on demand by token; never prerendered at build (no generateStaticParams).
export const dynamic = "force-dynamic";

// Thin server component -> "use client" child (mirrors app/(marketing)/m/[id]).
// The public fetch happens client-side inside this group's own ReactQueryProvider.
export default function CsatSurveyPage() {
  return <CsatSurveyClient />;
}

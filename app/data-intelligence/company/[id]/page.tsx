"use client";

import { useParams, useSearchParams } from "next/navigation";
import CompanyProfile360Client from "@/components/data-intelligence/company-profile/CompanyProfile360Client";
import { ProfileSource } from "@/lib/api/organization";

// Canonical Company 360 profile route (B2). Replaces the old
// industry-leaders/profile/[id] route's `?type=target` URL-sniffing: the
// caller must pass an explicit `?source=saved|search` rather than the page
// guessing which backend resource to call. Defaults to "search" only as a
// last resort (e.g. a bookmarked/typo'd URL) - every real navigation call
// site sets this explicitly.
export default function CompanyProfilePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const source = (searchParams.get("source") as ProfileSource) || "search";

    return <CompanyProfile360Client id={id} source={source} />;
}

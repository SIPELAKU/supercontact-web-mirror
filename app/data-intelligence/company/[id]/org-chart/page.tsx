"use client";

import { useParams, useSearchParams } from "next/navigation";
import OrgChartClient from "@/components/data-intelligence/company-profile/OrgChartClient";
import { ProfileSource } from "@/lib/api/organization";

export default function OrgChartPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const source = (searchParams.get("source") as ProfileSource) || "search";

    return <OrgChartClient id={id} source={source} />;
}

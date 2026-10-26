import { notFound } from "next/navigation";
import ProspectingClient from "@/components/data-intelligence/prospecting/ProspectingClient";
import { SHOW_DATA_INTEL_PREVIEW } from "@/lib/config/featureFlags";

export default function ProspectingPage() {
    // Unreleased: a direct URL must 404 too, not just the hidden menu entry.
    if (!SHOW_DATA_INTEL_PREVIEW) notFound();

    return <ProspectingClient />;
}

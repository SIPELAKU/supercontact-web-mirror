import { notFound } from "next/navigation";
import ProspectProfileClient from "@/components/data-intelligence/prospecting/ProspectProfileClient";
import { SHOW_DATA_INTEL_PREVIEW } from "@/lib/config/featureFlags";

// Server component (was "use client" + useParams) so the preview gate can call
// notFound() before anything renders; the profile itself stays client-side.
export default function ProspectProfilePage({ params }: { params: { id: string } }) {
    if (!SHOW_DATA_INTEL_PREVIEW) notFound();

    return <ProspectProfileClient personId={params.id} />;
}

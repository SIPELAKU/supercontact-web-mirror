"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/page-header";
import IcpAttributeBreakdownCard from "@/components/data-intelligence/icp/IcpAttributeBreakdownCard";
import IcpScoreBreakdown from "@/components/data-intelligence/icp/IcpScoreBreakdown";
import { useIcpLookalikes, useIcpProfile } from "@/lib/hooks/useIcpProfiles";
import { Loader2 } from "lucide-react";

export default function IcpProfileDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: profile, isLoading: isLoadingProfile, isError } = useIcpProfile(id);
    const { data: lookalikes, isLoading: isLoadingLookalikes } = useIcpLookalikes(id, {
        page: 1,
        limit: 20,
    });

    if (isLoadingProfile) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">ICP profile not found</h1>
                    <button
                        onClick={() => router.push("/data-intelligence/icp")}
                        className="mt-3 text-sm font-medium text-[#5479EE] hover:underline"
                    >
                        Back to ICP Builder
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title={profile.name}
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "ICP Builder", href: "/data-intelligence/icp" },
                    { label: profile.name },
                ]}
            />

            {profile.description && <p className="text-sm text-gray-500">{profile.description}</p>}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                        Derived From {profile.sample_size} Closed-Won Deal{profile.sample_size === 1 ? "" : "s"}
                    </h2>
                    {profile.generated_list_id && (
                        <Link
                            href={`/data-intelligence/companies?tab=lists&list=${profile.generated_list_id}`}
                            className="text-xs font-medium text-[#5479EE] hover:underline"
                        >
                            View generated list
                        </Link>
                    )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <IcpAttributeBreakdownCard label="Industry" stat={profile.attribute_breakdown.industry} />
                    <IcpAttributeBreakdownCard label="Location" stat={profile.attribute_breakdown.location} />
                    <IcpAttributeBreakdownCard
                        label="Employee Range"
                        stat={profile.attribute_breakdown.employee_range}
                    />
                    <IcpAttributeBreakdownCard
                        label="Financial Status"
                        stat={profile.attribute_breakdown.financial_status}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">
                    Lookalike Companies
                </h2>

                {isLoadingLookalikes ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : !lookalikes || lookalikes.data.length === 0 ? (
                    <p className="text-sm text-gray-500">No matching companies found yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {lookalikes.data.map((item) => (
                            <details key={item.id} className="group py-4">
                                <summary className="flex cursor-pointer items-center justify-between list-none">
                                    <div>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {[item.industry, item.location].filter(Boolean).join(" · ") || "—"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-[#5479EE10] px-3 py-1 text-xs font-semibold text-[#5479EE]">
                                            {item.match_score ?? "—"}% match
                                        </span>
                                        <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">
                                            ▾
                                        </span>
                                    </div>
                                </summary>
                                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                                    <IcpScoreBreakdown components={item.score_breakdown} />
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

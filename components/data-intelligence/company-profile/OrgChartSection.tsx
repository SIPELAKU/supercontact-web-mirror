"use client";

import { usePeopleGroupedBySeniority } from "@/lib/hooks/usePeople";

interface OrgChartSectionProps {
    organizationId: string | null;
}

// D3: the seniority-grouped body of what used to be the standalone
// /company/[id]/org-chart page - extracted so it can render directly
// inside the Company 360 profile's "People & Org" tab instead of behind
// a separate drill-down route. Not a reporting-line graph - no "reports
// to" relationships are inferred, only relative seniority.
export default function OrgChartSection({ organizationId }: OrgChartSectionProps) {
    const { data, isLoading } = usePeopleGroupedBySeniority(organizationId);
    const groups = data?.groups || [];

    if (!organizationId) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                This company hasn&apos;t been saved to CRM yet, so there&apos;s no shared record to attach
                people to.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[20vh] items-center justify-center text-gray-500">
                Loading org chart...
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No people recorded for this company yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.band} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase text-gray-400">
                        {group.label} <span className="text-gray-300">({group.people.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.people.map((person) => (
                            <div
                                key={person.id}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#5479EE]">
                                    {person.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {person.full_name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {person.title || "Unknown title"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

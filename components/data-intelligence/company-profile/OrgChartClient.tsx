"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/page-header";
import { fetchCompanyProfile360, ProfileSource } from "@/lib/api/organization";
import { usePeopleGroupedBySeniority } from "@/lib/hooks/usePeople";
import { useAuth } from "@/lib/context/AuthContext";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface OrgChartClientProps {
    id: string;
    source: ProfileSource;
}

export default function OrgChartClient({ id, source }: OrgChartClientProps) {
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<CompanyProfile360 | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoadingProfile(true);
            try {
                const token = await getToken();
                const data = await fetchCompanyProfile360(token, id, source);
                if (!cancelled) setProfile(data);
            } catch (err) {
                console.error("Failed to load company profile:", err);
            } finally {
                if (!cancelled) setIsLoadingProfile(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, source, getToken]);

    const { data, isLoading: isLoadingPeople } = usePeopleGroupedBySeniority(
        profile?.organizationId ?? null
    );
    const groups = data?.groups || [];
    const isLoading = isLoadingProfile || (!!profile?.organizationId && isLoadingPeople);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title={profile ? `${profile.name} - Org Chart` : "Org Chart"}
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Company Search", href: "/data-intelligence/industry-leaders" },
                    {
                        label: profile?.name || "Company",
                        href: `/data-intelligence/company/${id}?source=${source}`,
                    },
                    { label: "Org Chart" },
                ]}
            />

            <p className="text-sm text-gray-500">
                People grouped by seniority tier, inferred from their recorded title. This is not a
                reporting-line graph - no &quot;reports to&quot; relationships are inferred, only relative
                seniority.
            </p>

            {isLoading ? (
                <div className="flex min-h-[30vh] items-center justify-center text-gray-500">
                    Loading org chart...
                </div>
            ) : !profile?.organizationId ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                    This company hasn&apos;t been saved to CRM yet, so there&apos;s no shared record to
                    attach people to.
                </div>
            ) : groups.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                    No people recorded for this company yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div
                            key={group.band}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                        >
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
            )}
        </div>
    );
}

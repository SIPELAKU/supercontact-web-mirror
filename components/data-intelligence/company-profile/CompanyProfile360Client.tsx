"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard } from "@/components/omnichannel";
import { ConfidenceBadge } from "@/components/data-intelligence/ConfidenceBadge";
import { GoogleAttributionTag } from "@/components/data-intelligence/GoogleAttributionTag";
import AutomatedSignalsFeed, { AutomatedSignal } from "./AutomatedSignalsFeed";
import ProvenanceDrawer from "./ProvenanceDrawer";
import { fetchCompanyProfile360, ProfileSource } from "@/lib/api/organization";
import { saveCompanyToCrm } from "@/lib/api/company-intelligence";
import { fetchNotifications } from "@/lib/api/notifications";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";

interface CompanyProfile360ClientProps {
    id: string;
    source: ProfileSource;
}

function formatRevenue(revenue: number | null): string {
    if (revenue == null) return "Unknown";
    return `Rp ${revenue.toLocaleString("id-ID")}`;
}

export default function CompanyProfile360Client({ id, source }: CompanyProfile360ClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<CompanyProfile360 | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [signals, setSignals] = useState<AutomatedSignal[]>([]);
    const [isLoadingSignals, setIsLoadingSignals] = useState(false);
    const [provenanceOpen, setProvenanceOpen] = useState(false);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const data = await fetchCompanyProfile360(token, id, source);
            setProfile(data);
        } catch (err: any) {
            console.error("Failed to load company profile:", err);
            setError(err?.message || "Failed to load company profile.");
        } finally {
            setIsLoading(false);
        }
    }, [id, source, getToken]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Signals are keyed by the shared Organization id (see SignalEngineService),
    // which only exists once a cache row/CrmCompany has been resolved to one -
    // discovery-only search results with no organizationId simply show no
    // signals yet, which is correct (nothing has been recrawled for them).
    useEffect(() => {
        const organizationId = profile?.organizationId;
        if (!organizationId) {
            setSignals([]);
            return;
        }
        let cancelled = false;
        (async () => {
            setIsLoadingSignals(true);
            try {
                const token = await getToken();
                const res = await fetchNotifications(token, {
                    entityType: "organization",
                    entityId: organizationId,
                    limit: 20,
                });
                if (cancelled) return;
                setSignals(
                    res.data.map((n) => ({
                        id: n.id,
                        title: n.title,
                        description: n.description,
                        detectedAt: n.created_at,
                    }))
                );
            } catch (err) {
                console.error("Failed to load signals:", err);
                if (!cancelled) setSignals([]);
            } finally {
                if (!cancelled) setIsLoadingSignals(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [profile?.organizationId, getToken]);

    const handleSaveToCrm = async () => {
        if (!profile?.cacheId) return;
        setIsSaving(true);
        try {
            const token = await getToken();
            await saveCompanyToCrm(token, profile.cacheId);
            notify.success("Company saved to CRM successfully!");
        } catch (err: any) {
            console.error("Failed to save to CRM:", err);
            notify.error(err?.message || "Failed to save company to CRM");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-gray-600">Loading company profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{error || "Company Not Found"}</h1>
                    <p className="mt-2 text-gray-600">
                        {error ? "Please try again later." : "The company you're looking for doesn't exist."}
                    </p>
                    <AppButton
                        variantStyle="primary"
                        onClick={() => router.push("/data-intelligence/industry-leaders")}
                        className="mt-4"
                    >
                        Back to Company Search
                    </AppButton>
                </div>
            </div>
        );
    }

    const stats = [
        { title: "Industry", value: profile.industry || "Unknown", subtitle: "Primary sector" },
        {
            title: "Employees",
            value: profile.employeeCount != null ? profile.employeeCount : "Unknown",
            subtitle: "Estimated headcount",
        },
        { title: "Revenue", value: formatRevenue(profile.revenue), subtitle: "Estimated annual" },
        { title: "Financial Status", value: profile.financialStatus || "Unknown", subtitle: "Reference-based" },
    ];

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title={profile.name}
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Company Search", href: "/data-intelligence/industry-leaders" },
                    { label: profile.name },
                ]}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ConfidenceBadge tier={profile.confidenceTier} />
                <GoogleAttributionTag source={profile.providerSource} />
                <button
                    onClick={() => setProvenanceOpen(true)}
                    className="text-xs font-medium text-[#5479EE] hover:underline"
                >
                    View data sources
                </button>
                <div className="ml-auto">
                    {profile.source === "search" && (
                        <AppButton variantStyle="primary" onClick={handleSaveToCrm} isLoading={isSaving}>
                            Save to CRM
                        </AppButton>
                    )}
                </div>
            </div>

            <ProvenanceDrawer
                open={provenanceOpen}
                onClose={() => setProvenanceOpen(false)}
                fieldProvenance={profile.fieldProvenance}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <CompanyAbout
                        isLoading={false}
                        companyName={profile.name}
                        description={profile.description || "No description available."}
                        tags={profile.industry ? [profile.industry] : []}
                        yearsFounded="Unknown"
                        headquarters={profile.location || "Unknown"}
                        employees={profile.employeeCount != null ? String(profile.employeeCount) : "Unknown"}
                        status={profile.financialStatus || "Unknown"}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <CompanyDetailStats stats={stats} />
                    </div>

                    <AutomatedSignalsFeed signals={signals} isLoading={isLoadingSignals} />
                </div>

                <div className="space-y-6">
                    <CompanyKeyPeopleCard
                        isLoading={false}
                        people={profile.keyPeople.map((person) => ({
                            id: person.id || person.name,
                            name: person.name,
                            title: person.role || "",
                        }))}
                    />

                    {profile.subsidiaries.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                            <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Subsidiaries</h4>
                            <ul className="space-y-3">
                                {profile.subsidiaries.map((subsidiary: any, index: number) => (
                                    <li key={index} className="flex items-center text-sm font-medium text-gray-600">
                                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-black" />
                                        <span>
                                            {typeof subsidiary === "string"
                                                ? subsidiary
                                                : subsidiary.company || subsidiary.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

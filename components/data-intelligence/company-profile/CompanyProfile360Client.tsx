"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Tabs, Tab } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard } from "@/components/omnichannel";
import { ConfidenceBadge } from "@/components/data-intelligence/ConfidenceBadge";
import { GoogleAttributionTag } from "@/components/data-intelligence/GoogleAttributionTag";
import AutomatedSignalsFeed, { AutomatedSignal } from "./AutomatedSignalsFeed";
import ProvenanceList from "./ProvenanceList";
import OrgChartSection from "./OrgChartSection";
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

type ProfileTab = "overview" | "people-org" | "signals" | "sources";
const VALID_TABS: ProfileTab[] = ["overview", "people-org", "signals", "sources"];

function formatRevenue(revenue: number | null): string {
    if (revenue == null) return "Unknown";
    return `Rp ${revenue.toLocaleString("id-ID")}`;
}

export default function CompanyProfile360Client({ id, source }: CompanyProfile360ClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [profile, setProfile] = useState<CompanyProfile360 | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    // Separate from profile.source==="saved" - flips true the moment a
    // Save to CRM call succeeds this session, so the button doesn't just
    // silently vanish with no lasting confirmation (which used to make an
    // accidental double-save possible).
    const [isSaved, setIsSaved] = useState(false);
    const [signals, setSignals] = useState<AutomatedSignal[]>([]);
    const [isLoadingSignals, setIsLoadingSignals] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const requested = searchParams.get("tab") as ProfileTab | null;
        // Honors the redirect from the retired standalone org-chart route
        // (?tab=people-org) and makes every tab independently deep-linkable.
        return requested && VALID_TABS.includes(requested) ? requested : "overview";
    });

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const data = await fetchCompanyProfile360(token, id, source);
            setProfile(data);
            setIsSaved(data.source === "saved");
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
                    limit: 50,
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
            setIsSaved(true);
        } catch (err: any) {
            console.error("Failed to save to CRM:", err);
            notify.error(err?.message || "Failed to save company to CRM");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
        router.replace(`/data-intelligence/company/${id}?source=${source}&tab=${tab}`, { scroll: false });
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
                        onClick={() => router.push("/data-intelligence/companies?tab=discover")}
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
                    { label: "Company Search", href: "/data-intelligence/companies?tab=discover" },
                    { label: profile.name },
                ]}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ConfidenceBadge tier={profile.confidenceTier} />
                <GoogleAttributionTag source={profile.providerSource} />
                <div className="ml-auto">
                    {isSaved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={14} />
                            Saved to CRM
                        </span>
                    ) : (
                        <AppButton variantStyle="primary" onClick={handleSaveToCrm} isLoading={isSaving}>
                            Save to CRM
                        </AppButton>
                    )}
                </div>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => handleTabChange(val)}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "14px",
                            minWidth: "auto",
                            padding: "10px 4px",
                            marginRight: "28px",
                            color: "#6B7280",
                        },
                        "& .Mui-selected": { color: "#5479EE!important" },
                        "& .MuiTabs-indicator": { backgroundColor: "#5479EE" },
                    }}
                >
                    <Tab label="Overview" value="overview" disableRipple />
                    <Tab label="People & Org" value="people-org" disableRipple />
                    <Tab label="Signals" value="signals" disableRipple />
                    <Tab label="Sources" value="sources" disableRipple />
                </Tabs>
            </Box>

            {activeTab === "overview" && (
                <div className="space-y-6">
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
            )}

            {activeTab === "people-org" && (
                <div className="space-y-6">
                    <CompanyKeyPeopleCard
                        isLoading={false}
                        people={profile.keyPeople.map((person) => ({
                            id: person.id || person.name,
                            name: person.name,
                            title: person.role || "",
                        }))}
                    />
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Organization Chart
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            People grouped by seniority tier, inferred from their recorded title - not a
                            reporting-line graph.
                        </p>
                        <OrgChartSection organizationId={profile.organizationId} />
                    </div>
                </div>
            )}

            {activeTab === "signals" && (
                <AutomatedSignalsFeed signals={signals} isLoading={isLoadingSignals} />
            )}

            {activeTab === "sources" && <ProvenanceList fieldProvenance={profile.fieldProvenance} />}
        </div>
    );
}

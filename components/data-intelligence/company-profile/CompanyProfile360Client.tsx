"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppTabs } from "@/components/ui/app-tabs";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard } from "@/components/omnichannel";
import { ConfidenceBadge } from "@/components/data-intelligence/ConfidenceBadge";
import { GoogleAttributionTag } from "@/components/data-intelligence/GoogleAttributionTag";
import AutomatedSignalsFeed, { AutomatedSignal } from "./AutomatedSignalsFeed";
import ContactCard from "./ContactCard";
import CrmCompanyCommercialCard from "@/components/data-intelligence/company-profile/CrmCompanyCommercialCard";
import CrmCompanyCustomFieldsCard from "./CrmCompanyCustomFieldsCard";
import LegalRegistryCard from "./LegalRegistryCard";
import ProvenanceList from "./ProvenanceList";
import OrgChartSection from "./OrgChartSection";
import SocialLookupModal from "./SocialLookupModal";
import SocialPresenceCard, { SOCIAL_PLATFORM_LABELS } from "./SocialPresenceCard";
import { fetchCompanyProfile360, ProfileSource } from "@/lib/api/organization";
import { enrichSocialProfiles, saveCompanyToCrm } from "@/lib/api/company-intelligence";
import { verifyContact, VerificationResultItem } from "@/lib/api/verification";
import { fetchNotifications } from "@/lib/api/notifications";
import { CompanyProfile360, SocialLinksValues } from "@/lib/types/company-intelligence";
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
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRefreshingSocial, setIsRefreshingSocial] = useState(false);
    const [signals, setSignals] = useState<AutomatedSignal[]>([]);
    const [isLoadingSignals, setIsLoadingSignals] = useState(false);
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
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

    const handleVerifyContacts = async () => {
        if (!profile) return;
        // Verify the record this page actually displays and reloads from.
        // Saved profiles render the CrmCompany row (fromSaved reads
        // crm_companies.email/email_verification_status and hard-nulls the
        // phone trio), so the verify must write to that same row - targeting
        // the linked cache instead would (a) lose the badge on reload,
        // (b) attest the cache's email which can differ from the displayed
        // CRM email, and (c) invisibly bill a phone verification the card
        // never shows. Explicit kinds:["email"] matches the rendered rows.
        // Search profiles display the cache row itself, so the cache target
        // (default kinds = its non-empty email+phone) stays correct there.
        const target =
            profile.source === "saved" && profile.crmCompanyId
                ? {
                      target_type: "crm_company" as const,
                      target_id: profile.crmCompanyId,
                      kinds: ["email" as const],
                  }
                : profile.cacheId
                  ? { target_type: "cache" as const, target_id: profile.cacheId }
                  : null;
        if (!target) return;
        setIsVerifying(true);
        try {
            const token = await getToken();
            const { results } = await verifyContact(token, target);
            // Email "unknown & !cached" means no delivery evidence exists yet -
            // keep the record Unverified (don't write "unknown") and inform, not
            // congratulate. Real statuses (incl. cached email) still apply.
            const isEmailNoEvidence = (result: VerificationResultItem) =>
                result.kind === "email" && result.status === "unknown" && !result.cached;
            const realResults = results.filter((result) => !isEmailNoEvidence(result));
            setProfile((prev) => {
                if (!prev) return prev;
                const updated = { ...prev };
                for (const result of realResults) {
                    if (result.kind === "email") {
                        updated.emailVerificationStatus = result.status;
                        updated.emailVerifiedAt = result.checked_at;
                    } else if (result.kind === "phone") {
                        updated.phoneVerificationStatus = result.status;
                        updated.phoneLineType = result.line_type;
                        updated.phoneVerifiedAt = result.checked_at;
                    }
                }
                return updated;
            });
            if (realResults.length > 0) {
                notify.success("Contacts Verified", {
                    description: realResults
                        .map((result) => `${result.kind === "email" ? "Email" : "Phone"}: ${result.status}`)
                        .join(" · "),
                });
            }
            if (results.some(isEmailNoEvidence)) {
                notify.info("No delivery evidence yet", {
                    description:
                        "This email will be marked automatically once a campaign or omnichannel email reaches it.",
                });
            }
        } catch (err: any) {
            console.error("Failed to verify contacts:", err);
            notify.error(err?.message || "Failed to verify contacts");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRefreshSocial = async () => {
        // The enricher only works against a cache row - saved companies whose
        // cache link is severed never render the button (canRefresh=false).
        if (!profile?.cacheId) return;
        setIsRefreshingSocial(true);
        try {
            const token = await getToken();
            const { results } = await enrichSocialProfiles(token, profile.cacheId);
            const checkedAt = new Date().toISOString();
            const okResults = results.filter((result) => result.status === "ok");
            const failedResults = results.filter((result) => result.status === "failed");
            const notConfigured = results.filter((result) => result.status === "not_configured");
            const label = (platform: string) => SOCIAL_PLATFORM_LABELS[platform] ?? platform;
            // Merge fresh metrics into profile state rather than refetching:
            // the API persisted the same numbers under raw_data.social_profiles,
            // but the saved-path detail response carries no raw_data, so a
            // reload there would blank the metrics we just fetched. (A Threads
            // URL confirmed server-side from the IG handle surfaces on the
            // next full profile load - its metrics row shows immediately.)
            if (okResults.length > 0) {
                setProfile((prev) => {
                    if (!prev) return prev;
                    const merged = { ...(prev.socialProfiles ?? {}) };
                    for (const result of okResults) {
                        merged[result.platform] = {
                            ...merged[result.platform],
                            followers: result.followers ?? undefined,
                            verified: result.verified,
                            checked_at: checkedAt,
                        };
                    }
                    return { ...prev, socialProfiles: merged };
                });
                notify.success("Social data refreshed", {
                    description: [
                        ...okResults.map((result) =>
                            result.followers != null
                                ? `${label(result.platform)}: ${result.followers.toLocaleString("id-ID")} followers`
                                : `${label(result.platform)}: updated`
                        ),
                        ...failedResults.map((result) => `${label(result.platform)}: failed`),
                    ].join(" · "),
                });
            } else if (failedResults.length > 0) {
                notify.error("Social refresh failed", {
                    description: `${failedResults
                        .map((result) => label(result.platform))
                        .join(", ")} could not be refreshed.`,
                });
            } else if (notConfigured.length === 0) {
                notify.info("Nothing to refresh", {
                    description: "No social handles are stored for this company yet.",
                });
            }
            if (notConfigured.length > 0) {
                notify.info("Provider not configured", {
                    description: `${notConfigured
                        .map((result) => label(result.platform))
                        .join(", ")}: provider not configured on this environment.`,
                });
            }
        } catch (err: any) {
            console.error("Failed to refresh social data:", err);
            notify.error(err?.message || "Failed to refresh social data");
        } finally {
            setIsRefreshingSocial(false);
        }
    };

    // Search Assist paste-back succeeded - the PATCH response carries all six
    // canonical stored links, so sync them wholesale into profile state (no
    // refetch: the saved-path reload would blank in-state social metrics).
    const handleSocialLinksSaved = (values: SocialLinksValues) => {
        setProfile((prev) =>
            prev
                ? {
                      ...prev,
                      instagramUrl: values.instagram_url,
                      facebookUrl: values.facebook_url,
                      linkedinUrl: values.linkedin_url,
                      tiktokUrl: values.tiktok_url,
                      xUrl: values.x_url,
                      threadsUrl: values.threads_url,
                  }
                : prev
        );
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
                <div className="ml-auto flex items-center gap-3">
                    {profile.cacheId && (
                        <AppButton
                            variantStyle="outline"
                            color="gray"
                            onClick={() => setIsSocialModalOpen(true)}
                        >
                            Look Up Facebook/Instagram
                        </AppButton>
                    )}
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

            {profile.cacheId && (
                <SocialLookupModal
                    open={isSocialModalOpen}
                    onClose={() => setIsSocialModalOpen(false)}
                    onSuccess={loadProfile}
                    cacheId={profile.cacheId}
                />
            )}

            <AppTabs<ProfileTab>
                value={activeTab}
                onChange={handleTabChange}
                tabs={[
                    { value: "overview", label: "Overview" },
                    { value: "people-org", label: "People & Org" },
                    { value: "signals", label: "Signals" },
                    { value: "sources", label: "Sources" },
                ]}
            />

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

                    <ContactCard
                        profile={profile}
                        canVerify={Boolean(profile.cacheId || profile.crmCompanyId)}
                        isVerifying={isVerifying}
                        onVerify={handleVerifyContacts}
                    />

                    <SocialPresenceCard
                        profile={profile}
                        canRefresh={Boolean(profile.cacheId)}
                        isRefreshing={isRefreshingSocial}
                        onRefresh={handleRefreshSocial}
                        cacheId={profile.cacheId ?? null}
                        onLinksSaved={handleSocialLinksSaved}
                    />

                    {profile.social && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                            <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">
                                Facebook / Instagram
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                                {profile.social.category && <span>{profile.social.category}</span>}
                                {profile.social.follower_count != null && (
                                    <span>{profile.social.follower_count.toLocaleString("id-ID")} followers</span>
                                )}
                                {profile.social.is_verified && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        <CheckCircle2 size={12} />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

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

                    <LegalRegistryCard profile={profile} />

                    {/* The commercial card (Phase 3, spec I5): the only place
                        in the product where a tenant can set NPWP and the
                        address on a saved CRM company - the five values the
                        quotation PDF prints - plus the two reference columns.
                        Mounted under the same saved-profile guard as the
                        custom-fields card below it. */}
                    {profile.source === "saved" && profile.crmCompanyId && (
                        <CrmCompanyCommercialCard
                            crmCompanyId={profile.crmCompanyId}
                            customerTypeName={profile.customerTypeName}
                            regionName={profile.regionName}
                            values={{
                                customerTypeId: profile.customerTypeId,
                                regionId: profile.regionId,
                                npwp: profile.npwp,
                                addressLine: profile.addressLine,
                                kecamatan: profile.kecamatan,
                                kabupaten: profile.kabupaten,
                                postalCode: profile.postalCode,
                            }}
                            onSaved={(next) =>
                                setProfile((prev) =>
                                    prev
                                        ? {
                                              ...prev,
                                              customerTypeId: next.customerTypeId,
                                              regionId: next.regionId,
                                              npwp: next.npwp,
                                              addressLine: next.addressLine,
                                              kecamatan: next.kecamatan,
                                              kabupaten: next.kabupaten,
                                              postalCode: next.postalCode,
                                          }
                                        : prev
                                )
                            }
                        />
                    )}

                    {/* Tenant-defined company attributes live on the CrmCompany
                        row, so only a SAVED profile has them (Phase 1). */}
                    {profile.source === "saved" && profile.crmCompanyId && (
                        <CrmCompanyCustomFieldsCard
                            crmCompanyId={profile.crmCompanyId}
                            values={profile.customFields}
                            onSaved={(customFields) =>
                                setProfile((prev) => (prev ? { ...prev, customFields } : prev))
                            }
                        />
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

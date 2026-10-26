"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, Sparkles, Building2 } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { VerificationBadge } from "@/components/data-intelligence/VerificationBadge";
import { CreditBalancePill } from "@/components/data-intelligence/CreditBalancePill";
import AutomatedSignalsFeed, { AutomatedSignal } from "@/components/data-intelligence/company-profile/AutomatedSignalsFeed";
import { EnrichPersonDialog } from "@/components/data-intelligence/prospecting/EnrichPersonDialog";
import { useAuth } from "@/lib/context/AuthContext";
import { getPersonDetail, getEnrichmentCreditBalance } from "@/lib/api/person-intelligence";
import { PersonDetailResponse } from "@/lib/types/person-intelligence";
import { handleError } from "@/lib/utils/errorHandler";

type TabValue = "overview" | "employment" | "sources";

interface ProspectProfileClientProps {
    personId: string;
}

function formatDate(value: string | null): string {
    if (!value) return "present";
    return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function ProspectProfileClient({ personId }: ProspectProfileClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [person, setPerson] = useState<PersonDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableCredits, setAvailableCredits] = useState<number | null>(null);
    const [unlimitedCredits, setUnlimitedCredits] = useState(false);
    const [enrichOpen, setEnrichOpen] = useState(false);

    const tab = (searchParams.get("tab") as TabValue) || "overview";
    const setTab = (value: TabValue) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const fetchPerson = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const data = await getPersonDetail(token, personId);
            setPerson(data);
        } catch (err: any) {
            setError(handleError(err, "Load Person"));
        } finally {
            setIsLoading(false);
        }
    }, [getToken, personId]);

    const fetchCredit = useCallback(async () => {
        try {
            const token = await getToken();
            const { available, unlimited } = await getEnrichmentCreditBalance(token);
            setAvailableCredits(Math.trunc(parseFloat(available)));
            setUnlimitedCredits(unlimited);
        } catch (err) {
            console.error("Failed to fetch enrichment credit balance:", err);
        }
    }, [getToken]);

    useEffect(() => {
        fetchPerson();
    }, [fetchPerson]);

    useEffect(() => {
        fetchCredit();
    }, [fetchCredit]);

    const employmentSignals = useMemo<AutomatedSignal[]>(() => {
        if (!person) return [];
        return person.employment.map((job) => ({
            id: `${job.organization_id}-${job.start_date ?? "unknown"}`,
            title: job.title ? `${job.title} at ${job.organization_name}` : job.organization_name,
            description: `${formatDate(job.start_date)} — ${job.is_current ? "present" : formatDate(job.end_date)}${
                job.is_current ? " · Current" : ""
            }`,
            // AutomatedSignalsFeed sorts newest-first by relative time off this
            // field; start_date is the right anchor since a role's own
            // recency (not when we happened to observe it) is what "3 years
            // ago" should describe here.
            detectedAt: job.start_date ?? job.end_date ?? new Date().toISOString(),
        }));
    }, [person]);

    if (isLoading) {
        return <div className="p-8 text-sm text-gray-500">Loading…</div>;
    }

    if (error || !person) {
        return (
            <div className="p-8 text-sm text-rose-600">
                {error ?? "Person not found."}
            </div>
        );
    }

    const primaryEmail = person.emails.find((e) => e.is_primary) ?? person.emails[0];
    const primaryPhone = person.phones.find((p) => p.is_primary) ?? person.phones[0];

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title={person.full_name}
                description={
                    person.title && person.organization_name
                        ? `${person.title} at ${person.organization_name}`
                        : person.organization_name || undefined
                }
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Prospecting", href: "/data-intelligence/prospecting" },
                    { label: person.full_name },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <CreditBalancePill available={availableCredits} unlimited={unlimitedCredits} />
                        <AppButton variantStyle="primary" startIcon={<Sparkles size={15} />} onClick={() => setEnrichOpen(true)}>
                            Enrich · 3 credits
                        </AppButton>
                    </div>
                }
            />

            <AppTabs<TabValue>
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: "overview", label: "Overview" },
                    { value: "employment", label: "Employment History" },
                    { value: "sources", label: "Sources" },
                ]}
            />

            {tab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                            <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Contact channels</h4>
                            {person.emails.length === 0 && person.phones.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No contact channels yet — request an enrichment to look for verified email and phone.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3 text-sm">
                                    {person.emails.map((e) => (
                                        <div key={e.email} className="flex min-w-0 flex-wrap items-center gap-2">
                                            <a
                                                href={`mailto:${e.email}`}
                                                className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                            >
                                                <Mail size={14} className="shrink-0 text-gray-400" />
                                                <span className="truncate">{e.email}</span>
                                            </a>
                                            <VerificationBadge status={e.verification_status} className="shrink-0" />
                                            {e.is_primary && <span className="text-xs text-gray-400">primary</span>}
                                        </div>
                                    ))}
                                    {person.phones.map((p) => (
                                        <div key={p.phone} className="flex min-w-0 flex-wrap items-center gap-2">
                                            <a
                                                href={`tel:${p.phone}`}
                                                className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                            >
                                                <Phone size={14} className="shrink-0 text-gray-400" />
                                                <span className="truncate">{p.phone}</span>
                                            </a>
                                            <VerificationBadge
                                                status={p.verification_status}
                                                lineType={p.line_type}
                                                className="shrink-0"
                                            />
                                            {p.is_primary && <span className="text-xs text-gray-400">primary</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {person.organization_name && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                                <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Current employment</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{person.organization_name}</div>
                                        <div className="text-xs text-gray-500">{person.title || "—"}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg h-fit">
                        <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Enrichment activity</h4>
                        {person.last_enrichment ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-gray-50 p-3 text-center">
                                    <div className="text-lg font-bold text-gray-900">
                                        {parseFloat(person.last_enrichment.credits_used)}
                                    </div>
                                    <div className="text-[11px] text-gray-500">Credits spent</div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3 text-center">
                                    <div className="text-lg font-bold text-gray-900">
                                        {new Date(person.last_enrichment.completed_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                    <div className="text-[11px] text-gray-500">Last enriched</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">
                                Not enriched by your team yet.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {tab === "employment" && (
                <div className="max-w-2xl">
                    <AutomatedSignalsFeed signals={employmentSignals} />
                </div>
            )}

            {tab === "sources" && (
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-[11px] font-bold uppercase text-gray-400">
                                <th className="px-6 py-3">Field</th>
                                <th className="px-6 py-3">Value</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Confidence</th>
                                <th className="px-6 py-3">Collected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {person.provenance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No source information recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                person.provenance.map((row) => (
                                    <tr key={row.field} className="border-t border-gray-100">
                                        <td className="px-6 py-3 font-medium text-gray-900">{row.field}</td>
                                        <td className="max-w-xs truncate px-6 py-3 text-gray-600">{row.value || "—"}</td>
                                        <td className="px-6 py-3 text-gray-500">{row.source || "—"}</td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {row.confidence != null ? row.confidence.toFixed(2) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-400">
                                            {row.collected_at ? new Date(row.collected_at).toLocaleDateString("id-ID") : "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <EnrichPersonDialog
                open={enrichOpen}
                onClose={() => setEnrichOpen(false)}
                person={{
                    full_name: person.full_name,
                    title: person.title,
                    company_name: person.organization_name,
                    company_domain: person.organization_domain,
                    linkedin_url: person.linkedin_url,
                }}
                availableCredits={availableCredits}
                unlimitedCredits={unlimitedCredits}
                onQueued={() => {
                    fetchCredit();
                }}
            />
        </div>
    );
}

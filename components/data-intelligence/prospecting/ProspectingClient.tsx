"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Linkedin, Sparkles, Users } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { CreditBalancePill } from "@/components/data-intelligence/CreditBalancePill";
import { EnrichPersonDialog } from "@/components/data-intelligence/prospecting/EnrichPersonDialog";
import { useAuth } from "@/lib/context/AuthContext";
import { searchPersons, getEnrichmentCreditBalance } from "@/lib/api/person-intelligence";
import { PersonSearchResultItem } from "@/lib/types/person-intelligence";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

export default function ProspectingClient() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [rows, setRows] = useState<PersonSearchResultItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableCredits, setAvailableCredits] = useState<number | null>(null);
    const [isCreditLoading, setIsCreditLoading] = useState(true);

    const [tableState, setTableState] = useState({
        pagination: { pageIndex: 0, pageSize: 20 },
        globalFilter: "",
        titleContains: "",
        companyDomain: "",
    });

    const [enrichTarget, setEnrichTarget] = useState<PersonSearchResultItem | null>(null);

    const fetchCredit = useCallback(async () => {
        setIsCreditLoading(true);
        try {
            const token = await getToken();
            const { available } = await getEnrichmentCreditBalance(token);
            setAvailableCredits(Math.trunc(parseFloat(available)));
        } catch (err) {
            // Non-fatal — the pill just shows "—" and the real 402 guard
            // still lives server-side. Don't block the list over this.
            console.error("Failed to fetch enrichment credit balance:", err);
        } finally {
            setIsCreditLoading(false);
        }
    }, [getToken]);

    const fetchPeople = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const data = await searchPersons(token, {
                name: tableState.globalFilter || undefined,
                title_contains: tableState.titleContains || undefined,
                company_domain: tableState.companyDomain || undefined,
                limit: tableState.pagination.pageSize,
                offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
            });
            setRows(data.items);
            setTotalCount(data.total);
        } catch (err: any) {
            console.error("Failed to search people:", err);
            setError(handleError(err, "Search People"));
        } finally {
            setIsLoading(false);
        }
    }, [getToken, tableState]);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    useEffect(() => {
        fetchCredit();
    }, [fetchCredit]);

    const columns = useMemo<MRT_ColumnDef<PersonSearchResultItem>[]>(
        () => [
            {
                accessorKey: "full_name",
                header: "Name",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5479EE] text-sm font-semibold text-white">
                            {row.original.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-semibold text-gray-900">{row.original.full_name}</span>
                            <span className="truncate text-xs text-gray-500">{row.original.title || "—"}</span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "organization_name",
                header: "Company",
                enableColumnFilter: false,
                Cell: ({ row }) => <>{row.original.organization_name || "—"}</>,
            },
            {
                accessorKey: "primary_email",
                header: "Email",
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) =>
                    row.original.primary_email ? (
                        <a
                            href={`mailto:${row.original.primary_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                        >
                            <Mail size={13} className="shrink-0 text-gray-400" />
                            <span className="truncate">{row.original.primary_email}</span>
                        </a>
                    ) : (
                        <span className="text-xs text-gray-400">Not enriched yet</span>
                    ),
            },
            {
                id: "linkedin",
                header: "LinkedIn",
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) =>
                    row.original.linkedin_url ? (
                        <a
                            href={
                                row.original.linkedin_url.startsWith("http")
                                    ? row.original.linkedin_url
                                    : `https://${row.original.linkedin_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#5479EE] hover:bg-[#DDE4FC]"
                        >
                            <Linkedin size={14} />
                        </a>
                    ) : (
                        <span className="text-xs text-gray-300">—</span>
                    ),
            },
        ],
        []
    );

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Prospecting"
                description="Search the shared identity graph for free, then enrich the people who matter — one click gets you every verified channel we can find, metered per person."
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Prospecting" }]}
                actions={<CreditBalancePill available={availableCredits} isLoading={isCreditLoading} />}
            />

            {rows.length === 0 && !isLoading && !error ? (
                <EmptyState
                    icon={Users}
                    title="No people found"
                    description="Try adjusting your search, or a different job title / company domain filter."
                />
            ) : (
                <SuperTable<PersonSearchResultItem>
                    entityLabel="people"
                    searchPlaceholder="Search by name"
                    tableId="prospecting-table"
                    data={rows}
                    columns={columns}
                    rowCount={totalCount}
                    manualFiltering
                    manualPagination
                    manualSorting={false}
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage={error ?? "Failed to search people. Please try again."}
                    onRetry={fetchPeople}
                    getRowId={(row) => row.id}
                    primaryColumn={{
                        accessorKey: "full_name",
                        href: (row) => `/data-intelligence/prospect/${row.id}`,
                    }}
                    renderEmptyState={() => (
                        <EmptyState
                            icon={Users}
                            title="No people found"
                            description="Try adjusting your search, or a different job title / company domain filter."
                        />
                    )}
                    filters={[
                        { id: "titleContains", label: "Title contains", type: "text", placeholder: "e.g. CTO, VP Engineering" },
                        { id: "companyDomain", label: "Company domain", type: "text", placeholder: "e.g. abc.co.id" },
                    ]}
                    onStateChange={(s: SuperTableState) =>
                        setTableState({
                            pagination: s.pagination,
                            globalFilter: s.globalFilter || "",
                            titleContains: (s.filters.titleContains as string) || "",
                            companyDomain: (s.filters.companyDomain as string) || "",
                        })
                    }
                    rowActions={[
                        {
                            id: "enrich",
                            label: "Enrich this person",
                            icon: <Sparkles size={16} />,
                            onClick: (row) => setEnrichTarget(row),
                        },
                        {
                            id: "view-profile",
                            label: "View profile",
                            onClick: (row) => router.push(`/data-intelligence/prospect/${row.id}`),
                        },
                    ]}
                    features={{
                        pagination: true,
                        globalFilter: true,
                        columnFilters: false,
                        sorting: false,
                        urlSync: true,
                        rowSelection: "none",
                        export: { excel: false, csv: false },
                        densityToggle: true,
                        fullScreenToggle: true,
                        facetedValues: false,
                    }}
                />
            )}

            {enrichTarget && (
                <EnrichPersonDialog
                    open={!!enrichTarget}
                    onClose={() => setEnrichTarget(null)}
                    person={{
                        full_name: enrichTarget.full_name,
                        title: enrichTarget.title,
                        company_name: enrichTarget.organization_name,
                        linkedin_url: enrichTarget.linkedin_url,
                    }}
                    availableCredits={availableCredits}
                    onQueued={() => {
                        notify.success("Enrichment queued", {
                            description: `${enrichTarget.full_name} will be updated shortly.`,
                        });
                        fetchCredit();
                    }}
                />
            )}
        </div>
    );
}

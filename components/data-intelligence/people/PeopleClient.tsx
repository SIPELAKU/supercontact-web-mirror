"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Chip } from "@mui/material";
import { Save as SaveIcon, Users, Mail, Phone, Linkedin } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { INDUSTRY_OPTIONS } from "@/lib/data/company-intelligence-options";
import { useAuth } from "@/lib/context/AuthContext";
import { getIndividualIntelligence, saveContactsToCrm } from "@/lib/api/company-intelligence";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

// One row per PERSON, flattened from the API's "one item per company (with
// a key_people[] array)" shape - fixes two things the old card-grid page
// had: no link from a person back to their company, and no seniority
// signal even though the backend has computed one (C1's
// normalize_title_to_seniority) since before this page ever used it.
interface PersonRow {
    rowId: string;
    personId: string | null;
    personName: string;
    personRole: string;
    seniority: string | null;
    companyId: string;
    companyName: string;
    industry: string;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
}

const SENIORITY_LABELS: Record<string, string> = {
    c_suite: "C-Suite",
    vp: "VP",
    director: "Director",
    manager: "Manager",
    staff: "Staff",
};

const SENIORITY_COLORS: Record<string, { backgroundColor: string; color: string }> = {
    c_suite: { backgroundColor: "#E8E4FF", color: "#6A5BF7" },
    vp: { backgroundColor: "#DDF7FF", color: "#1C93B8" },
    director: { backgroundColor: "#E2F8E8", color: "#1D8F4E" },
    manager: { backgroundColor: "#FFF3D1", color: "#D0941F" },
    staff: { backgroundColor: "#F3F4F6", color: "#6B7280" },
};

export default function PeopleClient() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [rows, setRows] = useState<PersonRow[]>([]);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savingRowId, setSavingRowId] = useState<string | null>(null);

    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [tableState, setTableState] = useState({
        pagination: { pageIndex: 0, pageSize: 10 },
        globalFilter: "",
    });

    const fetchPeople = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const data = await getIndividualIntelligence(token, {
                industry: selectedIndustries.length > 0 ? selectedIndustries.join(",") : undefined,
                search: tableState.globalFilter || undefined,
                page: tableState.pagination.pageIndex + 1,
                limit: tableState.pagination.pageSize,
            });
            const flattened: PersonRow[] = (data.data || []).flatMap((company) =>
                company.key_people.map((person) => ({
                    rowId: `${company.crm_company_id}-${person.id}`,
                    personId: person.id || null,
                    personName: person.name,
                    personRole: person.role || "",
                    seniority: person.group || null,
                    companyId: company.crm_company_id || "",
                    companyName: company.company_name,
                    industry: company.industry || "",
                    email: person.email || null,
                    phone: person.phone || null,
                    linkedinUrl: person.linkedin_url || null,
                }))
            );
            setRows(flattened);
            setTotalCompanies(data.meta.total);
        } catch (err: any) {
            console.error("Failed to fetch people:", err);
            setError(handleError(err, "Fetch People"));
        } finally {
            setIsLoading(false);
        }
    }, [getToken, selectedIndustries, tableState]);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    const saveToContact = async (people: PersonRow[]) => {
        return saveContactsToCrm(await getToken(), {
            people: people.map((p) => ({
                crm_company_id: p.companyId,
                person_id: p.personId || undefined,
                name: p.personName,
                role: p.personRole,
            })),
        });
    };

    const handleSaveOne = async (row: PersonRow) => {
        setSavingRowId(row.rowId);
        try {
            const result = await saveToContact([row]);
            notify.success("Contact Saved", {
                description: result.created_count > 0 ? `${row.personName} saved as a contact.` : `${row.personName} was already a contact.`,
            });
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Save Contact") });
        } finally {
            setSavingRowId(null);
        }
    };

    const handleBulkSave = async (people: PersonRow[], clearSelection: () => void) => {
        if (people.length === 0) return;
        setIsSaving(true);
        try {
            const result = await saveToContact(people);
            notify.success("Contacts Saved", {
                description: `Successfully saved ${result.created_count} new contacts (${result.existing_count} already existed).`,
            });
            clearSelection();
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Save Contacts") });
        } finally {
            setIsSaving(false);
        }
    };

    const columns = useMemo<MRT_ColumnDef<PersonRow>[]>(
        () => [
            {
                accessorKey: "personName",
                header: "Person",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#6A5BF7]">
                            {row.original.personName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{row.original.personName}</span>
                    </div>
                ),
            },
            {
                accessorKey: "personRole",
                header: "Title",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span>{row.original.personRole || "-"}</span>
                        {row.original.seniority && SENIORITY_LABELS[row.original.seniority] && (
                            <Chip
                                size="small"
                                label={SENIORITY_LABELS[row.original.seniority]}
                                sx={{
                                    fontSize: "11px",
                                    height: "20px",
                                    fontWeight: 500,
                                    ...(SENIORITY_COLORS[row.original.seniority] || {}),
                                }}
                            />
                        )}
                    </div>
                ),
            },
            {
                id: "contact",
                header: "Contact",
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) => {
                    const { email, phone, linkedinUrl } = row.original;
                    if (!email && !phone && !linkedinUrl) {
                        return <span className="text-xs text-gray-400">-</span>;
                    }
                    return (
                        <div className="flex flex-col gap-0.5 text-xs">
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                >
                                    <Mail size={12} className="shrink-0 text-gray-400" />
                                    <span className="truncate">{email}</span>
                                </a>
                            )}
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                >
                                    <Phone size={12} className="shrink-0 text-gray-400" />
                                    <span className="truncate">{phone}</span>
                                </a>
                            )}
                            {linkedinUrl && (
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                >
                                    <Linkedin size={12} className="shrink-0 text-gray-400" />
                                    <span className="truncate">LinkedIn</span>
                                </a>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "companyName",
                header: "Company",
                enableColumnFilter: false,
                Cell: ({ row }) =>
                    row.original.companyId ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/data-intelligence/company/${row.original.companyId}?source=saved`);
                            }}
                            className="text-sm font-medium text-[#5479EE] hover:underline"
                        >
                            {row.original.companyName}
                        </button>
                    ) : (
                        <span className="text-sm text-gray-600">{row.original.companyName}</span>
                    ),
            },
            {
                accessorKey: "industry",
                header: "Industry",
                enableColumnFilter: false,
                Cell: ({ row }) => <>{row.original.industry || "-"}</>,
            },
            {
                id: "actions",
                header: "Actions",
                enableColumnFilter: false,
                enableSorting: false,
                size: 100,
                Cell: ({ row }) => (
                    <Box onClick={(e) => e.stopPropagation()}>
                        <AppButton
                            size="small"
                            variantStyle="outline"
                            disabled={savingRowId === row.original.rowId}
                            onClick={() => handleSaveOne(row.original)}
                        >
                            {savingRowId === row.original.rowId ? "Saving..." : "Save"}
                        </AppButton>
                    </Box>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [savingRowId]
    );

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader title="People" breadcrumbs={[{ label: "Data Intelligence" }, { label: "People" }]} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                    <AppAutocomplete
                        multiple
                        options={INDUSTRY_OPTIONS}
                        value={selectedIndustries}
                        onChange={(_, newValue) => setSelectedIndustries(newValue)}
                        placeholder="Industry"
                        size="small"
                        isBgWhite
                    />
                </div>
            </div>

            {rows.length === 0 && !isLoading && !error ? (
                <EmptyState
                    icon={Users}
                    title="No people found"
                    description="Try adjusting your filters or search query."
                />
            ) : (
                <SuperTable<PersonRow>
                    tableId="people-table"
                    data={rows}
                    columns={columns}
                    // NOTE: the /company-intelligence/individual endpoint paginates by
                    // COMPANY (meta.total = companies with key_people) while each table row
                    // is a PERSON. rowCount must stay company-based so the page count math
                    // (ceil(total/limit)) matches the server's company pagination; the
                    // "of N" label is therefore companies, not people. A true people total
                    // needs a backend meta field (deferred - not in the sort_by/sort_order
                    // contract).
                    rowCount={totalCompanies}
                    manualFiltering
                    manualPagination
                    manualSorting
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage={error ?? "Failed to load people. Please try again."}
                    renderEmptyState={() => (
                        <EmptyState icon={Users} title="No people found" description="Try adjusting your filters or search query." />
                    )}
                    onStateChange={(s: SuperTableState) =>
                        setTableState({ pagination: s.pagination, globalFilter: s.globalFilter || "" })
                    }
                    renderBulkActions={({ selectedRows, clearSelection }) => (
                        <AppButton
                            variantStyle="primary"
                            disabled={isSaving}
                            startIcon={<SaveIcon size={16} />}
                            onClick={() => handleBulkSave(selectedRows, clearSelection)}
                        >
                            {isSaving ? "Saving..." : `Save Selected (${selectedRows.length})`}
                        </AppButton>
                    )}
                    features={{
                        pagination: true,
                        globalFilter: true,
                        columnFilters: false,
                        sorting: false,
                        urlSync: true,
                        rowSelection: "multi",
                        export: { excel: false, csv: false },
                        densityToggle: true,
                        fullScreenToggle: true,
                        facetedValues: false,
                    }}
                />
            )}
        </div>
    );
}

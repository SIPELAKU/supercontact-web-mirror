"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, Tab, CircularProgress } from "@mui/material";
import { Plus, ListPlus, Save as SaveIcon, Printer, Radar, ListChecks, Trash2, Upload } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import { CompanyStats } from "@/components/omnichannel";
import CompanyTable from "@/components/data-intelligence/company-table/CompanyTable";
import CompanyFilterRail from "./CompanyFilterRail";
import ActiveFilterChips from "./ActiveFilterChips";
import CreateListModal from "@/components/data-intelligence/lists/CreateListModal";
import ImportCompaniesModal from "./ImportCompaniesModal";
import AddToListModal from "@/components/data-intelligence/lists/AddToListModal";
import AddSelectedToListModal from "@/components/data-intelligence/lists/AddSelectedToListModal";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import {
    searchCompanyIntelligence,
    saveCompanyToCrm,
    bulkSaveCompaniesToCrm,
    getMyTargetCompanies,
    deleteTargetCompany,
} from "@/lib/api/company-intelligence";
import {
    CompanyIntelligenceItem,
    CompanyIntelligenceSearchPayload,
    MyTargetCompaniesSummary,
} from "@/lib/types/company-intelligence";
import { FilterCriteria, DEFAULT_FILTER_CRITERIA } from "@/lib/types/IndustryLeader";
import { useCompanyLists, useCompanyListMembers, useRemoveCompanyListMember } from "@/lib/hooks/useCompanyLists";
import { CompanyListMemberItem } from "@/lib/types/company-list";

type WorkspaceTab = "discover" | "saved" | "lists";

function filterCriteriaToPayload(
    criteria: FilterCriteria,
    extra?: Partial<CompanyIntelligenceSearchPayload>
): CompanyIntelligenceSearchPayload {
    // Backend rejects a candidate outright when employee_count is unset and
    // EITHER bound is present (Google Maps/SerpAPI never fill headcount) -
    // sending the slider's default range on every search silently zeroed
    // out every freshly-discovered result, including the ones a kabupaten-
    // targeted Maps search exists specifically to surface. Only send the
    // bounds once the user has actually moved the slider off its default.
    const defaultRange = DEFAULT_FILTER_CRITERIA.employeeRange;
    const employeeRangeTouched =
        criteria.employeeRange.min !== defaultRange.min ||
        criteria.employeeRange.max !== defaultRange.max;

    return {
        industries: criteria.industries,
        locations: criteria.locations,
        kabupaten: criteria.kabupaten.length ? criteria.kabupaten : undefined,
        employee_min: employeeRangeTouched ? criteria.employeeRange.min : undefined,
        employee_max: employeeRangeTouched ? criteria.employeeRange.max : undefined,
        financial_status: criteria.financialStatuses,
        has_phone: criteria.hasPhone || undefined,
        has_domain: criteria.hasDomain || undefined,
        min_confidence: criteria.minConfidence || undefined,
        exclude_saved: criteria.excludeSaved || undefined,
        limit: 100,
        ...extra,
    };
}

// CompanyListMemberItem is a narrower shape than CompanyIntelligenceItem -
// this fills the gap so the SAME CompanyTable can render Discover/Saved/
// Lists rows with identical columns, per the "same visual language whether
// you're discovering or managing" goal.
function memberToCompanyItem(member: CompanyListMemberItem): CompanyIntelligenceItem {
    return {
        id: member.id,
        external_id: "",
        name: member.name,
        ticker: null,
        domain: member.domain,
        phone: null,
        email: null,
        description: "",
        industry: member.industry,
        location: member.location || "",
        employee_count: member.employee_count ?? 0,
        revenue: member.revenue,
        financial_status: member.financial_status || "",
        source: "",
        confidence_tier: null,
        match_score: 0,
        raw_data: null,
        organization_id: null,
        created_at: "",
    };
}

function parseFilterFromParam(raw: string | null): FilterCriteria {
    if (!raw) return DEFAULT_FILTER_CRITERIA;
    try {
        return { ...DEFAULT_FILTER_CRITERIA, ...JSON.parse(decodeURIComponent(raw)) };
    } catch {
        return DEFAULT_FILTER_CRITERIA;
    }
}

const criteriaEqual = (a: FilterCriteria, b: FilterCriteria) => JSON.stringify(a) === JSON.stringify(b);

export default function CompaniesWorkspaceClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    // ===== Tab + shared filter state =====
    // Both live in this one orchestrator, not per-tab - that's what lets
    // "save current filters as a Dynamic List" work from anywhere in the
    // workspace (the Discover filter state never gets cleared switching
    // tabs), and what replaces sessionStorage with real, shareable URL
    // state (fixes the old stale-cache-on-back-navigation bug).
    const [activeTab, setActiveTabState] = useState<WorkspaceTab>(
        (searchParams.get("tab") as WorkspaceTab) || "discover"
    );
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(() =>
        parseFilterFromParam(searchParams.get("f"))
    );

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("tab", activeTab);
        if (!criteriaEqual(filterCriteria, DEFAULT_FILTER_CRITERIA)) {
            params.set("f", encodeURIComponent(JSON.stringify(filterCriteria)));
        }
        router.replace(`/data-intelligence/companies?${params.toString()}`, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, filterCriteria]);

    const setActiveTab = (tab: WorkspaceTab) => setActiveTabState(tab);

    // ===== Discover tab =====
    const [discoverCompanies, setDiscoverCompanies] = useState<CompanyIntelligenceItem[]>([]);
    const [discoverTotal, setDiscoverTotal] = useState(0);
    const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
    const [discoverError, setDiscoverError] = useState<string | null>(null);
    const [discoverTableState, setDiscoverTableState] = useState({
        pagination: { pageIndex: 0, pageSize: 20 },
        globalFilter: "",
    });
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchDiscover = useCallback(async () => {
        setIsDiscoverLoading(true);
        setDiscoverError(null);
        try {
            const token = await getToken();
            const payload = filterCriteriaToPayload(filterCriteria, {
                page: discoverTableState.pagination.pageIndex + 1,
                limit: discoverTableState.pagination.pageSize,
                q: discoverTableState.globalFilter || "",
            });
            const response = await searchCompanyIntelligence(token, payload);
            setDiscoverCompanies(response.results);
            setDiscoverTotal(response.total);
        } catch (err: any) {
            console.error("Failed to search companies:", err);
            setDiscoverError(err.message || "Failed to load companies. Please try again.");
        } finally {
            setIsDiscoverLoading(false);
        }
    }, [filterCriteria, discoverTableState, getToken]);

    useEffect(() => {
        if (activeTab === "discover") fetchDiscover();
    }, [activeTab, fetchDiscover]);

    const handleSaveToCrm = async (id: string) => {
        setSavingId(id);
        try {
            const token = await getToken();
            await saveCompanyToCrm(token, id);
            notify.success("Company saved to CRM successfully!");
        } catch (err: any) {
            notify.error(err.message || "Failed to save company to CRM");
        } finally {
            setSavingId(null);
        }
    };

    const handleBulkSaveToCrm = async (ids: string[], clearSelection: () => void) => {
        if (ids.length === 0) return;
        setIsBulkSaving(true);
        try {
            const token = await getToken();
            await bulkSaveCompaniesToCrm(token, ids);
            notify.success(`${ids.length} companies saved to CRM successfully!`);
            clearSelection();
        } catch (err: any) {
            notify.error(err.message || "Failed to save companies to CRM");
        } finally {
            setIsBulkSaving(false);
        }
    };

    // ===== Saved tab =====
    const [savedCompanies, setSavedCompanies] = useState<CompanyIntelligenceItem[]>([]);
    const [savedTotal, setSavedTotal] = useState(0);
    const [isSavedLoading, setIsSavedLoading] = useState(false);
    const [savedError, setSavedError] = useState<string | null>(null);
    const [savedSummary, setSavedSummary] = useState<MyTargetCompaniesSummary | undefined>(undefined);
    const [savedTableState, setSavedTableState] = useState({
        pagination: { pageIndex: 0, pageSize: 10 },
        globalFilter: "",
    });

    const fetchSaved = useCallback(async () => {
        setIsSavedLoading(true);
        setSavedError(null);
        try {
            const token = await getToken();
            const data = await getMyTargetCompanies(token, {
                industry: filterCriteria.industries,
                location: filterCriteria.locations,
                search: savedTableState.globalFilter || "",
                page: savedTableState.pagination.pageIndex + 1,
                limit: savedTableState.pagination.pageSize,
            });
            setSavedCompanies(data.data || []);
            setSavedTotal(data.meta.total);
            setSavedSummary(data.summary);
        } catch (err: any) {
            setSavedError(err.message || "Failed to fetch companies");
        } finally {
            setIsSavedLoading(false);
        }
    }, [filterCriteria.industries, filterCriteria.locations, savedTableState, getToken]);

    useEffect(() => {
        if (activeTab === "saved") fetchSaved();
    }, [activeTab, fetchSaved]);

    const handleDeleteSaved = (id: string) => {
        const company = savedCompanies.find((c) => c.id === id);
        confirm({
            variant: "danger",
            title: "Delete Company",
            description: `Are you sure you want to delete ${company?.name || "this company"} from your saved companies?`,
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    const token = await getToken();
                    await deleteTargetCompany(token, id);
                    notify.success("Company deleted successfully");
                    fetchSaved();
                } catch (err: any) {
                    notify.error(err.message || "Failed to delete company");
                }
            },
        });
    };

    const handleBulkDeleteSaved = (ids: string[], clearSelection: () => void) => {
        if (ids.length === 0) return;
        confirm({
            variant: "danger",
            title: "Delete Companies",
            description: `Are you sure you want to delete ${ids.length} companies from your saved companies?`,
            confirmText: `Delete (${ids.length})`,
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    const token = await getToken();
                    await Promise.all(ids.map((id) => deleteTargetCompany(token, id)));
                    notify.success(`${ids.length} companies deleted successfully`);
                    clearSelection();
                    fetchSaved();
                } catch (err: any) {
                    notify.error("Failed to delete some companies");
                    fetchSaved();
                }
            },
        });
    };

    // Export loops all pages (SuperTable's export feature calls this once
    // and expects the full matching dataset back) - ported as-is from the
    // page this replaces.
    const handleExportRequest = async (): Promise<CompanyIntelligenceItem[]> => {
        try {
            const token = await getToken();
            let allData: CompanyIntelligenceItem[] = [];
            let currentPage = 1;
            let totalPages = 1;
            do {
                const data = await getMyTargetCompanies(token, {
                    industry: filterCriteria.industries,
                    location: filterCriteria.locations,
                    search: savedTableState.globalFilter || "",
                    page: currentPage,
                    limit: 50,
                });
                const items = data.data || [];
                const total = data.meta.total || 0;
                totalPages = Math.ceil(total / 50) || 1;
                allData = [...allData, ...items];
                currentPage++;
            } while (currentPage <= totalPages);
            return allData;
        } catch (err) {
            console.error("Export error:", err);
            return [];
        }
    };

    const printableRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: printableRef, documentTitle: "Saved Companies" });
    const printableColumns = [
        { header: "Company Name", accessorKey: "name" },
        { header: "Industry", accessorKey: "industry" },
        { header: "Location", accessorKey: "location" },
        { header: "Employees", accessorKey: "employee_count" },
        { header: "Financial Status", accessorKey: "financial_status" },
    ];

    // ===== Lists tab =====
    const [selectedListId, setSelectedListId] = useState<string | null>(searchParams.get("list"));
    const { data: listsResponse, isLoading: isListsLoading, refetch: refetchLists } = useCompanyLists({
        limit: 100,
    });
    const lists = listsResponse?.data || [];
    const {
        data: membersResponse,
        isLoading: isMembersLoading,
        isError: isMembersError,
        error: membersError,
        refetch: refetchMembers,
    } = useCompanyListMembers(activeTab === "lists" ? selectedListId : null, { limit: 100 });
    const listMembers = (membersResponse?.data || []).map(memberToCompanyItem);
    const removeMemberMutation = useRemoveCompanyListMember();

    useEffect(() => {
        if (activeTab === "lists" && !selectedListId && lists.length > 0) {
            setSelectedListId(lists[0].id);
        }
    }, [activeTab, lists, selectedListId]);

    const selectedList = lists.find((l) => l.id === selectedListId) || null;

    const handleRemoveMember = (crmCompanyId: string, name: string) => {
        if (!selectedListId) return;
        confirm({
            variant: "danger",
            title: "Remove from List",
            description: `Remove "${name}" from this list?`,
            confirmText: "Remove",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await removeMemberMutation.mutateAsync({ id: selectedListId, crmCompanyId });
                    notify.success("Removed", { description: `"${name}" removed from the list.` });
                    refetchMembers();
                    refetchLists();
                } catch (err: any) {
                    notify.error("Error", { description: handleError(err, "Remove Member") });
                }
            },
        });
    };

    // ===== Modals =====
    const [showImportCompanies, setShowImportCompanies] = useState(false);
    const [showCreateList, setShowCreateList] = useState(false);
    const [createListDefaultType, setCreateListDefaultType] = useState<"static" | "dynamic">("static");
    const [showAddToSelectedList, setShowAddToSelectedList] = useState(false);
    const [showAddSelectedToList, setShowAddSelectedToList] = useState(false);
    const [addToListIds, setAddToListIds] = useState<string[]>([]);
    const bulkClearSelectionRef = useRef<() => void>(() => {});

    const openCreateList = (defaultType: "static" | "dynamic") => {
        setCreateListDefaultType(defaultType);
        setShowCreateList(true);
    };

    const openAddSelectedToList = (ids: string[], clearSelection: () => void) => {
        setAddToListIds(ids);
        bulkClearSelectionRef.current = clearSelection;
        setShowAddSelectedToList(true);
    };

    const handleRowClick = (row: CompanyIntelligenceItem, source: "search" | "saved") => {
        router.push(`/data-intelligence/company/${row.id}?source=${source}`);
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Companies"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Companies" }]}
                actions={
                    activeTab === "lists" ? (
                        <AppButton
                            variantStyle="primary"
                            onClick={() => openCreateList("static")}
                            startIcon={<Plus size={16} />}
                        >
                            Create List
                        </AppButton>
                    ) : undefined
                }
            />

            <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                    minHeight: "unset",
                    padding: "4px",
                    backgroundColor: "#f0f2f5",
                    borderRadius: "8px",
                    display: "inline-flex",
                    "& .MuiTabs-indicator": { display: "none" },
                }}
            >
                {(["discover", "saved", "lists"] as WorkspaceTab[]).map((tab) => (
                    <Tab
                        key={tab}
                        label={tab === "discover" ? "Discover" : tab === "saved" ? "Saved" : "Lists"}
                        value={tab}
                        disableRipple
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            minHeight: "32px",
                            minWidth: "auto",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#64748B",
                            transition: "all 0.2s",
                            "&.Mui-selected": {
                                color: "#0F172A",
                                backgroundColor: "#FFFFFF",
                                boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06)",
                            },
                        }}
                    />
                ))}
            </Tabs>

            {activeTab === "discover" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <CompanyFilterRail mode="discover" filterCriteria={filterCriteria} onChange={setFilterCriteria} />
                    </div>
                    <div className="space-y-4 lg:col-span-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <ActiveFilterChips mode="discover" filterCriteria={filterCriteria} onChange={setFilterCriteria} />
                            <div className="ml-auto flex items-center gap-3">
                                <AppButton
                                    variantStyle="outline"
                                    onClick={() => setShowImportCompanies(true)}
                                    startIcon={<Upload size={16} />}
                                >
                                    Import CSV
                                </AppButton>
                                <AppButton
                                    variantStyle="outline"
                                    onClick={() => openCreateList("dynamic")}
                                    startIcon={<ListPlus size={16} />}
                                >
                                    Save as List
                                </AppButton>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            {isDiscoverLoading ? "Searching..." : `${discoverTotal} companies found`}
                        </p>
                        <CompanyTable
                            tableId="companies-discover"
                            companies={discoverCompanies}
                            isLoading={isDiscoverLoading}
                            isError={!!discoverError}
                            errorMessage={discoverError ?? undefined}
                            onRetry={fetchDiscover}
                            emptyStateTitle="No companies found"
                            emptyStateDescription="Try adjusting your filters or search query."
                            rowCount={discoverTotal}
                            enableColumnFilters={false}
                            onStateChange={(s) =>
                                setDiscoverTableState({ pagination: s.pagination, globalFilter: s.globalFilter || "" })
                            }
                            onRowClick={(row) => handleRowClick(row, "search")}
                            rowActions={[
                                {
                                    id: "save-to-crm",
                                    label: "Save to CRM",
                                    icon: <SaveIcon size={16} />,
                                    isLoading: (row) => savingId === row.id,
                                    onClick: (row) => handleSaveToCrm(row.id),
                                },
                            ]}
                            renderBulkActions={({ selectedRows, clearSelection }) => (
                                <AppButton
                                    variantStyle="primary"
                                    disabled={isBulkSaving}
                                    startIcon={<SaveIcon size={16} />}
                                    onClick={() =>
                                        handleBulkSaveToCrm(selectedRows.map((r) => r.id), clearSelection)
                                    }
                                >
                                    {isBulkSaving ? "Saving..." : `Save Selected (${selectedRows.length})`}
                                </AppButton>
                            )}
                        />
                    </div>
                </div>
            )}

            {activeTab === "saved" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <CompanyFilterRail mode="saved" filterCriteria={filterCriteria} onChange={setFilterCriteria} />
                    </div>
                    <div className="space-y-4 lg:col-span-3">
                        <ActiveFilterChips mode="saved" filterCriteria={filterCriteria} onChange={setFilterCriteria} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <CompanyStats summary={savedSummary} />
                        </div>
                        <CompanyTable
                            tableId="companies-saved"
                            companies={savedCompanies}
                            isLoading={isSavedLoading}
                            isError={!!savedError}
                            errorMessage={savedError ?? undefined}
                            onRetry={fetchSaved}
                            emptyStateTitle="No saved companies"
                            emptyStateDescription="Companies you save from Discover will show up here."
                            rowCount={savedTotal}
                            enableColumnFilters={false}
                            onStateChange={(s) =>
                                setSavedTableState({ pagination: s.pagination, globalFilter: s.globalFilter || "" })
                            }
                            onExportRequest={handleExportRequest}
                            onRowClick={(row) => handleRowClick(row, "saved")}
                            renderTopLeftToolbar={() => (
                                <AppButton
                                    variantStyle="outline"
                                    color="gray"
                                    onClick={handlePrint}
                                    startIcon={<Printer size={16} />}
                                >
                                    <span className="hidden sm:inline">Print PDF</span>
                                </AppButton>
                            )}
                            rowActions={[
                                {
                                    id: "delete",
                                    label: "Delete",
                                    icon: <Trash2 size={16} />,
                                    destructive: true,
                                    onClick: (row) => handleDeleteSaved(row.id),
                                },
                            ]}
                            renderBulkActions={({ selectedRows, clearSelection }) => (
                                <>
                                    <AppButton
                                        variantStyle="outline"
                                        startIcon={<ListPlus size={16} />}
                                        onClick={() =>
                                            openAddSelectedToList(selectedRows.map((r) => r.id), clearSelection)
                                        }
                                    >
                                        Add to List
                                    </AppButton>
                                    <AppButton
                                        variantStyle="danger"
                                        onClick={() =>
                                            handleBulkDeleteSaved(selectedRows.map((r) => r.id), clearSelection)
                                        }
                                    >
                                        {`Delete (${selectedRows.length})`}
                                    </AppButton>
                                </>
                            )}
                        />
                    </div>
                </div>
            )}

            {activeTab === "lists" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4">
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">My Lists</h3>
                            {isListsLoading ? (
                                <div className="flex justify-center py-6">
                                    <CircularProgress size={20} />
                                </div>
                            ) : lists.length === 0 ? (
                                <EmptyState
                                    icon={ListPlus}
                                    title="No lists yet"
                                    description="Create one to get started."
                                    action={{ label: "Create List", onClick: () => openCreateList("static"), icon: <Plus size={16} /> }}
                                />
                            ) : (
                                <div className="space-y-1">
                                    {lists.map((list) => (
                                        <button
                                            key={list.id}
                                            onClick={() => setSelectedListId(list.id)}
                                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                                selectedListId === list.id
                                                    ? "bg-[#EEF2FD] font-medium text-[#5479EE]"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                {list.list_type === "dynamic" ? (
                                                    <Radar size={14} className="shrink-0" />
                                                ) : (
                                                    <ListChecks size={14} className="shrink-0" />
                                                )}
                                                <span className="truncate">{list.name}</span>
                                            </span>
                                            <span className="shrink-0 text-xs text-gray-400">{list.member_count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 lg:col-span-3">
                        {selectedList && (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedList.name}</h2>
                                    {selectedList.description && (
                                        <p className="text-sm text-gray-500">{selectedList.description}</p>
                                    )}
                                </div>
                                {selectedList.list_type === "static" && (
                                    <AppButton
                                        variantStyle="outline"
                                        onClick={() => setShowAddToSelectedList(true)}
                                        startIcon={<Plus size={16} />}
                                    >
                                        Add Companies
                                    </AppButton>
                                )}
                            </div>
                        )}

                        {selectedList?.list_type === "dynamic" && (
                            <p className="rounded-lg bg-[#5479EE10] px-4 py-3 text-sm text-[#5479EE]">
                                This list auto-refreshes from a saved filter - matching companies are added
                                automatically each time you view it.
                            </p>
                        )}

                        <CompanyTable
                            tableId="companies-lists"
                            companies={listMembers}
                            isLoading={isMembersLoading}
                            isError={isMembersError}
                            errorMessage={membersError instanceof Error ? membersError.message : undefined}
                            onRetry={() => refetchMembers()}
                            rowCount={listMembers.length}
                            enableColumnFilters={false}
                            rowSelection="none"
                            emptyStateTitle="No companies yet"
                            emptyStateDescription={
                                selectedList?.list_type === "dynamic"
                                    ? "No companies match this list's filter yet."
                                    : "No companies in this list yet."
                            }
                            emptyStateAction={
                                selectedList?.list_type === "static"
                                    ? { label: "Add Companies", onClick: () => setShowAddToSelectedList(true), icon: <Plus size={16} /> }
                                    : undefined
                            }
                            onRowClick={(row) => handleRowClick(row, "saved")}
                            rowActions={[
                                {
                                    id: "remove",
                                    label: "Remove",
                                    icon: <Trash2 size={16} />,
                                    destructive: true,
                                    onClick: (row) => handleRemoveMember(row.id, row.name),
                                },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* Hidden printable table for Saved tab's Print PDF */}
            <div style={{ display: "none" }}>
                <PrintableTable ref={printableRef} title="Saved Companies" columns={printableColumns} data={savedCompanies} />
            </div>

            <ImportCompaniesModal
                open={showImportCompanies}
                onClose={() => setShowImportCompanies(false)}
                // Imported rows land in the tenant-private intelligence cache,
                // which is what the Discover search surfaces.
                onSuccess={fetchDiscover}
            />
            <CreateListModal
                open={showCreateList}
                onClose={() => setShowCreateList(false)}
                onSuccess={() => refetchLists()}
                defaultListType={createListDefaultType}
                // Always the live Discover filter state, regardless of how
                // the modal was opened - the modal itself only cares about
                // this once the user has Dynamic selected, so gating it on
                // createListDefaultType here would wrongly show "no
                // filters available" if someone opens via "Create List"
                // (defaults to Static) and then switches to Dynamic inside
                // the modal while real filters exist.
                currentFilter={filterCriteriaToPayload(filterCriteria)}
            />
            {selectedListId && (
                <AddToListModal
                    open={showAddToSelectedList}
                    listId={selectedListId}
                    existingMemberIds={listMembers.map((m) => m.id)}
                    onClose={() => setShowAddToSelectedList(false)}
                    onSuccess={() => {
                        refetchMembers();
                        refetchLists();
                    }}
                />
            )}
            <AddSelectedToListModal
                open={showAddSelectedToList}
                crmCompanyIds={addToListIds}
                onClose={() => setShowAddSelectedToList(false)}
                onSuccess={() => {
                    bulkClearSelectionRef.current();
                    fetchSaved();
                }}
            />
            {confirmationPopup}
        </div>
    );
}

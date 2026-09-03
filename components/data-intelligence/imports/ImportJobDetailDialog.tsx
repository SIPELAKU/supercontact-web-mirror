"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Building2, PlayCircle, RefreshCw, RotateCcw, StopCircle } from "lucide-react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { getImportJobCompanies } from "@/lib/api/company-intelligence";
import {
    CompanyImportJobAction,
    CompanyImportJobResponse,
    CompanyIntelligenceItem,
} from "@/lib/types/company-intelligence";
import { sourceGroup } from "@/lib/data/source-groups";
import { allowedJobActions } from "./ImportCenterClient";

// Span-based (AppDialog's description slot is a <p>, so a MUI Chip's <div>
// would be invalid nesting), same palette as the list's status chips.
function statusPillClass(status: string): string {
    switch (status) {
        case "Queued for Processing":
        case "Queued for Rollback":
            return "bg-blue-50 text-blue-600";
        case "Processing":
        case "Rollback Processing":
            return "bg-amber-50 text-amber-700";
        case "Completed":
            return "bg-green-50 text-green-600";
        case "Failed":
        case "Stopped":
        case "Rolled Back":
            return "bg-red-50 text-red-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

interface ImportJobDetailDialogProps {
    // Null keeps the dialog closed - the parent owns which job is selected
    // and keeps this object fresh while its list auto-refreshes.
    job: CompanyImportJobResponse | null;
    onClose: () => void;
    onAction: (job: CompanyImportJobResponse, action: CompanyImportJobAction) => void;
    actionPending: boolean;
}

const ACTION_BUTTONS: Array<{
    action: CompanyImportJobAction;
    label: string;
    icon: React.ReactNode;
    variantStyle: "outline" | "danger";
}> = [
    { action: "stop", label: "Stop", icon: <StopCircle size={16} />, variantStyle: "outline" },
    { action: "continue", label: "Continue", icon: <PlayCircle size={16} />, variantStyle: "outline" },
    { action: "rollback", label: "Rollback", icon: <RotateCcw size={16} />, variantStyle: "danger" },
    { action: "replay", label: "Replay", icon: <RefreshCw size={16} />, variantStyle: "outline" },
];

// Job drill-down: live counters, the guarded stop/continue/rollback/replay
// controls, and the actual cache rows this job created (endpoint B.4).
export default function ImportJobDetailDialog({
    job,
    onClose,
    onAction,
    actionPending,
}: ImportJobDetailDialogProps) {
    const { getToken } = useAuth();

    const [companies, setCompanies] = useState<CompanyIntelligenceItem[]>([]);
    const [companiesTotal, setCompaniesTotal] = useState(0);
    const [companiesPage, setCompaniesPage] = useState(1);
    const [companiesLimit, setCompaniesLimit] = useState(10);
    const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);
    const [companiesError, setCompaniesError] = useState<string | null>(null);

    const jobId = job?.id ?? null;
    // Refetch on status changes too: a finished rollback empties the list,
    // and a replay/continue keeps adding rows while the parent's poll moves
    // the status forward.
    const jobStatus = job?.status ?? null;

    // Start every newly-opened job at page 1 (state survives close/reopen
    // because the dialog component itself stays mounted).
    useEffect(() => {
        setCompaniesPage(1);
    }, [jobId]);

    const fetchCompanies = useCallback(async () => {
        if (!jobId) return;
        setIsCompaniesLoading(true);
        setCompaniesError(null);
        try {
            const token = await getToken();
            const data = await getImportJobCompanies(token, jobId, {
                page: companiesPage,
                limit: companiesLimit,
            });
            setCompanies(data.items || []);
            setCompaniesTotal(data.total || 0);
        } catch (err: any) {
            setCompaniesError(err.message || "Failed to load this job's companies");
        } finally {
            setIsCompaniesLoading(false);
        }
    }, [getToken, jobId, companiesPage, companiesLimit]);

    useEffect(() => {
        fetchCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCompanies, jobStatus]);

    const columns = useMemo<MRT_ColumnDef<CompanyIntelligenceItem>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Company",
                enableColumnFilter: false,
                Cell: ({ cell }) => <span className="font-medium">{cell.getValue<string>()}</span>,
            },
            {
                accessorKey: "domain",
                header: "Domain",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">{cell.getValue<string | null>() || "-"}</span>
                ),
            },
            {
                accessorKey: "industry",
                header: "Industry",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">{cell.getValue<string | null>() || "-"}</span>
                ),
            },
            {
                accessorKey: "location",
                header: "Location",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">{cell.getValue<string>() || "-"}</span>
                ),
            },
        ],
        []
    );

    if (!job) return null;

    const allowed = allowedJobActions(job.status);
    const group = sourceGroup(job.source);
    const SourceIcon = group.icon;

    return (
        <AppDialog
            open={!!job}
            onClose={onClose}
            maxWidth="lg"
            title={job.file_name || "Import job"}
            description={
                <span className="inline-flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPillClass(job.status)}`}
                    >
                        {job.status}
                    </span>
                    <span
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600"
                        title={job.source || group.label}
                    >
                        <SourceIcon size={14} className="shrink-0 text-gray-400" />
                        {group.label}
                    </span>
                    {job.is_shared_seed && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                            Platform seed
                        </span>
                    )}
                    <span className="text-sm text-gray-400">
                        {format(new Date(job.created_at), "dd MMM yyyy, HH:mm")}
                    </span>
                </span>
            }
        >
            <div className="flex flex-col gap-5">
                {/* Counters */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-700">
                            {job.processed_rows.toLocaleString()}
                            <span className="text-sm font-medium text-gray-400"> / {job.total_rows.toLocaleString()}</span>
                        </div>
                        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Processed</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">{job.created_rows.toLocaleString()}</div>
                        <div className="text-xs font-medium uppercase tracking-wider text-green-700/80">Created</div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-4 text-center">
                        <div className="text-2xl font-bold text-amber-700">{job.skipped_rows.toLocaleString()}</div>
                        <div className="text-xs font-medium uppercase tracking-wider text-amber-700/80">Skipped</div>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4 text-center">
                        <div className="text-2xl font-bold text-red-700">{job.failed_rows.toLocaleString()}</div>
                        <div className="text-xs font-medium uppercase tracking-wider text-red-700/80">Failed</div>
                    </div>
                </div>

                {/* Actions - every control visible, non-applicable ones disabled
                    with the reason inline (mirrors the API's status guards). */}
                <div className="flex flex-wrap items-center gap-3">
                    {ACTION_BUTTONS.map(({ action, label, icon, variantStyle }) => (
                        <AppButton
                            key={action}
                            variantStyle={variantStyle}
                            startIcon={icon}
                            disabled={actionPending || !allowed.has(action)}
                            onClick={() => onAction(job, action)}
                        >
                            {label}
                        </AppButton>
                    ))}
                    <span className="text-xs text-gray-400">
                        Available actions depend on the job status.
                    </span>
                </div>

                {job.messages && job.messages.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Messages</h4>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600">
                            {job.messages.map((msg, idx) => (
                                <li key={idx} className="break-words">{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Companies this job created */}
                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Companies created by this job
                    </h4>
                    <SuperTable<CompanyIntelligenceItem>
                        entityLabel="baris"
                        searchPlaceholder="Cari baris"
                        tableId="company-import-job-companies"
                        columns={columns}
                        data={companies}
                        rowCount={companiesTotal}
                        isLoading={isCompaniesLoading}
                        isError={!!companiesError}
                        errorMessage={companiesError ?? undefined}
                        onRetry={fetchCompanies}
                        manualPagination
                        // Snap the table (and our mirrored state) back to page
                        // 1 whenever a different job is opened.
                        resetPageKey={job.id}
                        onStateChange={(state) => {
                            if (state.pagination.pageIndex + 1 !== companiesPage) {
                                setCompaniesPage(state.pagination.pageIndex + 1);
                            }
                            if (state.pagination.pageSize !== companiesLimit) {
                                setCompaniesLimit(state.pagination.pageSize);
                                setCompaniesPage(1);
                            }
                        }}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={Building2}
                                title="No companies from this job"
                                description="Rows appear here as the job creates them; a rolled-back job leaves nothing behind."
                            />
                        )}
                        features={{
                            pagination: true,
                            globalFilter: false,
                            columnFilters: false,
                            sorting: false,
                            rowSelection: "none",
                            columnVisibility: false,
                            densityToggle: false,
                            fullScreenToggle: false,
                        }}
                    />
                </div>
            </div>
        </AppDialog>
    );
}

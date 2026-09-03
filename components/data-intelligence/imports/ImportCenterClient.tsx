"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Chip } from "@mui/material";
import {
    FileUp,
    PlayCircle,
    RefreshCw,
    RotateCcw,
    StopCircle,
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import ImportJobDetailDialog from "./ImportJobDetailDialog";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { getImportJobs, updateImportJobAction } from "@/lib/api/company-intelligence";
import {
    CompanyImportJobAction,
    CompanyImportJobResponse,
} from "@/lib/types/company-intelligence";
import { sourceGroup } from "@/lib/data/source-groups";

// Shared with ImportCompaniesModal's polling - a job in any other status is
// still moving and worth auto-refreshing.
const TERMINAL_STATUSES = new Set(["Completed", "Failed", "Stopped", "Rolled Back"]);
const AUTO_REFRESH_MS = 5000;

export function statusChipColor(
    status: string
): "default" | "info" | "warning" | "success" | "error" {
    switch (status) {
        case "Queued for Processing":
        case "Queued for Rollback":
            return "info";
        case "Processing":
        case "Rollback Processing":
            return "warning";
        case "Completed":
            return "success";
        case "Failed":
        case "Stopped":
        case "Rolled Back":
            return "error";
        default:
            return "default";
    }
}

// Which PATCH action each status admits - mirrors the API's guards (same
// machinery as the subscriber importer) so a disabled button here is exactly
// a 400 there.
export function allowedJobActions(status: string): Set<CompanyImportJobAction> {
    const allowed = new Set<CompanyImportJobAction>();
    if (status === "Queued for Processing" || status === "Processing") allowed.add("stop");
    if (status === "Stopped") allowed.add("continue");
    if (status === "Stopped" || status === "Completed") allowed.add("rollback");
    if (status === "Failed" || status === "Rolled Back") allowed.add("replay");
    return allowed;
}

export default function ImportCenterClient() {
    const { getToken } = useAuth();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    // ===== Job list =====
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [jobs, setJobs] = useState<CompanyImportJobResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ===== Detail dialog =====
    const [selectedJob, setSelectedJob] = useState<CompanyImportJobResponse | null>(null);
    const [actionPending, setActionPending] = useState(false);

    const fetchJobs = useCallback(
        async (background = false) => {
            if (background) setIsFetching(true);
            else setIsLoading(true);
            setError(null);
            try {
                const token = await getToken();
                const data = await getImportJobs(token, { page, limit, search: search || undefined });
                setJobs(data.items || []);
                setTotal(data.total || 0);
                // Keep the open detail dialog in sync with the refreshed row -
                // this is also what moves its status forward while polling.
                setSelectedJob((current) => {
                    if (!current) return current;
                    return data.items?.find((j) => j.id === current.id) ?? current;
                });
            } catch (err: any) {
                // A background poll failing shouldn't blank a table the user
                // is looking at - only surface errors from explicit loads.
                if (!background) setError(err.message || "Failed to load import jobs");
            } finally {
                setIsLoading(false);
                setIsFetching(false);
            }
        },
        [getToken, page, limit, search]
    );

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Auto-refresh while anything on the visible page is still moving (or a
    // just-triggered action hasn't reached a terminal state yet).
    const hasLiveJob = jobs.some((j) => !TERMINAL_STATUSES.has(j.status));
    useEffect(() => {
        if (!hasLiveJob) return;
        const timer = setInterval(() => fetchJobs(true), AUTO_REFRESH_MS);
        return () => clearInterval(timer);
    }, [hasLiveJob, fetchJobs]);

    // fetchJobs is recreated per page/filter change; the action handler runs
    // from dialog callbacks minutes later - go through a ref so it always
    // refreshes with the CURRENT list parameters.
    const fetchJobsRef = useRef(fetchJobs);
    useEffect(() => {
        fetchJobsRef.current = fetchJobs;
    }, [fetchJobs]);

    const runAction = async (job: CompanyImportJobResponse, action: CompanyImportJobAction) => {
        setActionPending(true);
        try {
            const token = await getToken();
            const updated = await updateImportJobAction(token, job.id, action);
            notify.success(`Job ${action} triggered`, {
                description: `"${job.file_name || "Import job"}" is now ${updated.status}.`,
            });
            setSelectedJob((current) => (current?.id === updated.id ? updated : current));
            setJobs((current) => current.map((j) => (j.id === updated.id ? updated : j)));
            fetchJobsRef.current(true);
        } catch (err: any) {
            notify.error(`Failed to ${action} job`, {
                description: handleError(err, "Import Job Action"),
            });
        } finally {
            setActionPending(false);
        }
    };

    const handleAction = (job: CompanyImportJobResponse, action: CompanyImportJobAction) => {
        // stop/continue are cheap and reversible; rollback deletes the rows
        // this job created and replay re-runs the whole payload - both get a
        // confirmation step.
        if (action === "rollback" || action === "replay") {
            confirm({
                variant: action === "rollback" ? "danger" : "warning",
                title: action === "rollback" ? "Rollback Import Job" : "Replay Import Job",
                description:
                    action === "rollback"
                        ? `Rollback "${job.file_name || "this job"}"? Companies created by this import (still private to your workspace) will be removed.`
                        : `Replay "${job.file_name || "this job"}"? The job's rows will be imported again from the start.`,
                confirmText: action === "rollback" ? "Rollback" : "Replay",
                cancelText: "Cancel",
                onConfirm: () => runAction(job, action),
            });
        } else {
            runAction(job, action);
        }
    };

    const columns = useMemo<MRT_ColumnDef<CompanyImportJobResponse>[]>(
        () => [
            {
                accessorKey: "file_name",
                header: "File Name",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <span className="inline-flex items-center gap-2">
                        <span className="max-w-[260px] truncate font-medium" title={row.original.file_name || undefined}>
                            {row.original.file_name || "-"}
                        </span>
                        {row.original.is_shared_seed && (
                            <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                Platform seed
                            </span>
                        )}
                    </span>
                ),
            },
            {
                accessorKey: "source",
                header: "Source",
                enableColumnFilter: false,
                size: 110,
                // Same icon + short group label idiom as CompanyTable; the
                // raw identifier only appears in the tooltip.
                Cell: ({ row }) => {
                    const raw = row.original.source || "";
                    const group = sourceGroup(raw);
                    const Icon = group.icon;
                    return (
                        <span
                            className="inline-flex items-center gap-1.5 whitespace-nowrap text-gray-600"
                            title={raw || group.label}
                        >
                            <Icon size={14} className="shrink-0 text-gray-400" />
                            {group.label}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                enableColumnFilter: false,
                Cell: ({ cell }) => {
                    const status = cell.getValue<string>();
                    return (
                        <Chip
                            label={status}
                            color={statusChipColor(status)}
                            size="small"
                            variant="outlined"
                        />
                    );
                },
            },
            {
                id: "results",
                header: "Results",
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) => {
                    const { total_rows, processed_rows, created_rows, skipped_rows, failed_rows } =
                        row.original;
                    return (
                        <div className="flex flex-col gap-0.5 text-xs">
                            <span className="text-gray-400">
                                Processed: {processed_rows.toLocaleString()} / {total_rows.toLocaleString()}
                            </span>
                            <span className="flex gap-2 whitespace-nowrap">
                                <span className="text-green-600">Created: {created_rows.toLocaleString()}</span>
                                <span className="text-gray-500">Skipped: {skipped_rows.toLocaleString()}</span>
                                <span className="text-red-600">Failed: {failed_rows.toLocaleString()}</span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: "Created",
                enableColumnFilter: false,
                Cell: ({ cell }) => {
                    const dateStr = cell.getValue<string>();
                    return (
                        <span className="text-sm text-gray-600">
                            {dateStr ? format(new Date(dateStr), "dd MMM yyyy, HH:mm") : "-"}
                        </span>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Import Center"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Imports" }]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[300px]">
                <section className="px-6 pt-5">
                    <p className="max-w-2xl text-sm text-gray-500">
                        Every bulk company import lands here as a job - watch its progress, open a
                        job to see exactly which companies it created, and stop, continue, rollback
                        or replay it. New imports start from the Companies workspace (Discover tab,
                        &quot;Import CSV&quot;).
                    </p>
                </section>

                <div className="mx-6 my-6">
                    <SuperTable<CompanyImportJobResponse>
                        entityLabel="impor"
                        searchPlaceholder="Cari nama berkas"
                        tableId="company-import-jobs"
                        columns={columns}
                        data={jobs}
                        rowCount={total}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        isError={!!error}
                        errorMessage={error ?? undefined}
                        onRetry={() => fetchJobs()}
                        manualPagination
                        onStateChange={(state) => {
                            if (state.pagination.pageIndex + 1 !== page) {
                                setPage(state.pagination.pageIndex + 1);
                            }
                            if (state.pagination.pageSize !== limit) {
                                setLimit(state.pagination.pageSize);
                                setPage(1);
                            }
                            if ((state.globalFilter || "") !== search) {
                                setSearch(state.globalFilter || "");
                                setPage(1);
                            }
                        }}
                        onRowClick={(row) => setSelectedJob(row)}
                        renderTopLeftToolbar={() => (
                            <AppButton
                                variantStyle="outline"
                                onClick={() => fetchJobs(true)}
                                startIcon={
                                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                                }
                            >
                                Refresh
                            </AppButton>
                        )}
                        rowActions={[
                            {
                                id: "stop",
                                label: "Stop",
                                icon: <StopCircle size={16} />,
                                hidden: (row) => !allowedJobActions(row.status).has("stop"),
                                onClick: (row) => handleAction(row, "stop"),
                            },
                            {
                                id: "continue",
                                label: "Continue",
                                icon: <PlayCircle size={16} />,
                                hidden: (row) => !allowedJobActions(row.status).has("continue"),
                                onClick: (row) => handleAction(row, "continue"),
                            },
                            {
                                id: "rollback",
                                label: "Rollback",
                                icon: <RotateCcw size={16} />,
                                destructive: true,
                                hidden: (row) => !allowedJobActions(row.status).has("rollback"),
                                onClick: (row) => handleAction(row, "rollback"),
                            },
                            {
                                id: "replay",
                                label: "Replay",
                                icon: <RefreshCw size={16} />,
                                hidden: (row) => !allowedJobActions(row.status).has("replay"),
                                onClick: (row) => handleAction(row, "replay"),
                            },
                        ]}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={FileUp}
                                title="No import jobs yet"
                                description="Bulk imports you run from the Companies workspace will appear here with their progress and results."
                            />
                        )}
                        features={{
                            pagination: true,
                            globalFilter: true,
                            columnFilters: false,
                            sorting: false,
                            rowSelection: "none",
                        }}
                    />
                </div>
            </div>

            <ImportJobDetailDialog
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onAction={handleAction}
                actionPending={actionPending}
            />
            {confirmationPopup}
        </div>
    );
}

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Stack, Chip, Tooltip, MenuItem, Select } from "@mui/material";
import { X, RefreshCw, StopCircle, PlayCircle, RotateCcw, History, UserCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable } from "@/components/ui/super-table";
import type { MRT_ColumnDef } from "@/components/ui/super-table/types";
import { useImportJobs, useImportJobAction, importJobsKey } from "@/lib/hooks/useImportJobs";
import { useListRefresh } from "@/lib/hooks/useListRefresh";
import { usePolling } from "@/lib/hooks/usePolling";
import { useImportWatch } from "@/lib/store/importWatch";
import { BulkJob } from "@/lib/types/email-marketing";
import { IMPORT_VIEWS, type ImportView } from "@/lib/utils/importModules";
import { AppButton } from "@/components/ui/app-button";
import { format } from "date-fns";
import { notify } from "@/lib/notifications";
import { importProgressPercent } from "./importProgress";
import { freshlyFinishedJobs } from "./finishedJobs";
import type { ImportJobAction } from "@/lib/api/import-jobs";
import { importJobActions, type ImportHistoryAction } from "./importJobState";
import { ImportDuplicateDialog } from "./ImportDuplicateDialog";

// Background import jobs of one module (Subscribers, Contacts, Recipients),
// all served by the same `/{module}/bulk` API shape (FE-5).
interface ImportHistoryModalProps {
  open: boolean;
  onClose: () => void;
  // Which imports it lists, and under which title (IMPORT_VIEWS).
  view: ImportView;
  mailingListIds?: string[];
  // A job completed or was rolled back while this page was open: refresh the
  // module's own list. Jobs already finished when it opened do not count.
  onDataChanged?: () => void;
}

const INTERVAL_OPTIONS = [
  { value: 0, label: "Off (Manual)" },
  { value: 2000, label: "2 Second (Very Fast)" },
  { value: 5000, label: "5 Second (Fast)" },
  { value: 10000, label: "10 Second (Medium)" },
  { value: 30000, label: "30 Second (Slow)" },
];

// Rows per batch. The `limit` state and the table both start from it: when
// they disagree the list is fetched twice on open, once per size.
const BATCH_SIZE = 25;

// Which buttons a job gets is decided by `importJobActions`.
const ACTION_BUTTONS: Record<ImportHistoryAction, { icon: React.ReactNode; tooltip: string; color: string }> = {
  review: { icon: <UserCheck size={18} />, tooltip: "Review duplicate", color: "#dc2626" },
  stop: { icon: <StopCircle size={18} />, tooltip: "Stop Job", color: "#ef4444" },
  continue: { icon: <PlayCircle size={18} />, tooltip: "Continue Job", color: "#3b82f6" },
  rollback: { icon: <RotateCcw size={18} />, tooltip: "Rollback Job", color: "#eab308" },
  replay: { icon: <RefreshCw size={18} />, tooltip: "Replay Job", color: "#10b981" },
};

const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  open,
  onClose,
  view,
  mailingListIds,
  onDataChanged,
}) => {
  const { module, history } = IMPORT_VIEWS[view];
  const { targetFilter, storageKey } = history;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(BATCH_SIZE);
  const [search, setSearch] = useState("");

  const [refetchInterval, setRefetchInterval] = useState<number | false>(5000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        setRefetchInterval(val === 0 ? false : val);
      } else {
        // Simpan default 5000 jika belum ada
        localStorage.setItem(storageKey, "5000");
        setRefetchInterval(5000);
      }
    }
  }, [storageKey]);

  const handleIntervalChange = (val: number) => {
    setRefetchInterval(val === 0 ? false : val);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, val.toString());
    }
  };

  const query = { page, limit, search, target: targetFilter, mailingListIds };
  // Not fetched at all while closed, so opening a page costs no history request.
  const { data, isLoading, isFetching, refetch } = useImportJobs(module, query, { enabled: open });

  // Every refresh - the auto-refresh tick and the Refresh button - starts the
  // list over from batch 1 with fresh rows. The infinite-scroll table only
  // replaces a batch when its length or first/last id changes, so a plain
  // refetch would never show a job's progress moving, and batches scrolled in
  // before the refresh would be stale anyway.
  const listRefresh = useListRefresh({
    batchIndex: page - 1,
    firstBatchKey: importJobsKey(module, { ...query, page: 1 }),
  });
  // Polls only while the modal is open (user request 2026-11-04: no requests
  // in the background). A job that finishes while it is closed still refreshes
  // the page's list - on the next open, when the fresh snapshot reports it
  // (finishedRef keeps what was already seen). Not before mount: hydration.
  usePolling(listRefresh.reload, mounted && open ? refetchInterval : false);

  // The import dock (FE-1) hides this module's cards while it is open. Only
  // an open modal reports, so a closed one on the same page changes nothing.
  const setHistoryOpen = useImportWatch((state) => state.setHistoryOpen);
  useEffect(() => {
    if (!open) return;
    setHistoryOpen(module, true);
    return () => setHistoryOpen(module, false);
  }, [open, module, setHistoryOpen]);

  // Closed: reset to the defaults the table reopens with, so reopening
  // fetches once, not once per change.
  useEffect(() => {
    if (open) return;
    setPage(1);
    setLimit(BATCH_SIZE);
    setSearch("");
  }, [open]);

  const actionMutation = useImportJobAction(module);
  // null until the first snapshot, which only seeds (see finishedJobs.ts).
  const finishedRef = React.useRef<Set<string> | null>(null);
  const onDataChangedRef = React.useRef(onDataChanged);
  onDataChangedRef.current = onDataChanged;

  // Refresh the module's list when a job completes or is rolled back.
  useEffect(() => {
    const items = data?.data?.items;
    if (!items) return;
    const { finished, seen } = freshlyFinishedJobs(finishedRef.current, items);
    finishedRef.current = seen;
    if (finished.length > 0) onDataChangedRef.current?.();
  }, [data]);

  // The job whose paused row is being answered (FE-3). A snapshot:
  // polling may reload the list meanwhile; an answer that comes too late is
  // a 409, which the dialog handles.
  const [reviewJob, setReviewJob] = useState<BulkJob | null>(null);

  const handleAction = (jobId: string, action: ImportJobAction) => {
    actionMutation.mutate(
      { jobId, action },
      {
        onSuccess: () => {
          notify.success(`Action ${action} triggered successfully.`);
          // The job's new status only shows after a restart from batch 1.
          void listRefresh.reload();
        },
        onError: (error: any) => {
          notify.error(`Failed to trigger action ${action}`, {
            description: error.message || "An unknown error occurred.",
          });
        }
      }
    );
  };

  const bulkJobs = data?.data?.items || [];
  // Undefined while the next batch loads, so the table keeps the last total
  // in its footer instead of flashing "0".
  const totalCount = data?.data?.total;

  const columns = useMemo<MRT_ColumnDef<BulkJob>[]>(
    () => [
      {
        accessorKey: "file_name",
        header: "File Name",
        filterVariant: "text",
        Cell: ({ cell }) => <span className="font-medium">{cell.getValue<string>()}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";

          if (status === "Uploading") {
            // Nothing is processed until the last part arrives; an upload that
            // never finishes is deleted by the API's recovery cron (30 min
            // without progress, checked every 15).
            return (
              <Tooltip
                title="Still uploading. If the upload does not finish, this job is removed automatically within about 45 minutes."
                arrow
                placement="top"
              >
                <Chip label={status} color="info" size="small" variant="outlined" />
              </Tooltip>
            );
          }

          if (status === "Waiting for Review") {
            // Paused until the row is answered.
            return (
              <Tooltip
                title="Paused at a row that matches an existing contact with different data."
                arrow
                placement="top"
              >
                <Chip label={status} color="error" size="small" variant="outlined" />
              </Tooltip>
            );
          }

          switch (status) {
            case "Queued for Processing":
            case "Queued for Rollback":
              color = "info";
              break;
            case "Processing":
            case "Rollback Processing":
              color = "warning";
              break;
            case "Completed":
              color = "success";
              break;
            case "Failed":
            case "Stopped":
            case "Rolled Back":
              color = "error";
              break;
          }

          return <Chip label={status} color={color} size="small" variant="outlined" />;
        },
      },
      {
        id: "progress",
        header: "Progress",
        Cell: ({ row }) => {
          const { total_rows, processed_rows, created_rows, updated_rows, skipped_rows, failed_rows } = row.original;
          const percent = importProgressPercent(processed_rows, total_rows);
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: "0.875rem" }}>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-gray-200"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent ?? undefined}
                >
                  <div
                    className={`h-full rounded-full transition-all ${percent === 100 ? "bg-green-500" : "bg-blue-500"}`}
                    style={{ width: `${percent ?? 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-gray-700">
                  {percent === null ? "—" : `${percent}%`}
                </span>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {processed_rows} / {total_rows}
                </Typography>
              </div>
              <Box sx={{ display: "flex", gap: 1 }}>
                <span className="text-green-600">Created: {created_rows}</span>
                <span className="text-blue-600">Updated: {updated_rows ?? 0}</span>
                <span className="text-gray-500">Skipped: {skipped_rows}</span>
                <span className="text-red-600">Failed: {failed_rows}</span>
              </Box>
            </Box>
          );
        },
      },
      {
        accessorKey: "messages",
        header: "Message",
        Cell: ({ cell }) => {
          const messages = cell.getValue<string[]>();

          if (!messages || messages.length === 0) return <span className="text-gray-500">-</span>;

          const content = (
            <ul className="list-disc pl-4 m-0 text-gray-600 text-xs text-left w-full space-y-0.5">
              {messages.map((msg, idx) => (
                <li key={idx} className="wrap-break-word">{msg}</li>
              ))}
            </ul>
          );

          return (
            <Tooltip
              title={
                <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 0.5 }}>
                  {content}
                </Box>
              }
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 400
                  }
                }
              }}
            >
              <Box sx={{
                maxHeight: 60,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                '&::after': messages.length > 2 ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '24px',
                  background: 'linear-gradient(transparent, white)'
                } : {}
              }}>
                {content}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Date",
        Cell: ({ cell }) => {
          const dateStr = cell.getValue<string>();
          return dateStr ? format(new Date(dateStr), "dd MMM yyyy, HH:mm") : "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => {
          const job = row.original;

          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {importJobActions(job.status).map((action) => {
                const { icon, tooltip, color } = ACTION_BUTTONS[action];
                return (
                  <Tooltip key={action} title={tooltip} placement="top" arrow>
                    <IconButton
                      size="small"
                      onClick={() => (action === "review" ? setReviewJob(job) : handleAction(job.id, action))}
                      disabled={actionMutation.isPending}
                      sx={{ color }}
                    >
                      {icon}
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>
          );
        },
      },
    ],
    [actionMutation.isPending]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "12px", minHeight: "60vh" },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Import History: {history.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your background bulk import processes.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        <SuperTable<BulkJob>
          entityLabel="impor"
          searchPlaceholder="Cari nama berkas"
          tableId="import-history-table"
          data={bulkJobs}
          columns={columns}
          rowCount={totalCount}
          // The skeleton shows on the first load of a search, and when a
          // refresh moves the table back up from a later batch. A refresh on
          // batch 1 swaps the rows in place.
          isLoading={isLoading || listRefresh.isRefreshing}
          restartKey={listRefresh.restartKey}
          initialState={{ pagination: { pageIndex: 0, pageSize: BATCH_SIZE } }}
          onRetry={() => refetch()}
          renderEmptyState={() => (
            <EmptyState
              icon={History}
              title="No import jobs yet"
              description="Bulk import jobs and their progress will appear here."
            />
          )}
          manualPagination={true}
          manualSorting={false}
          manualFiltering={false}
          onStateChange={(state) => {
            if (state.pagination.pageIndex + 1 !== page) {
              setPage(state.pagination.pageIndex + 1);
            }
            if (state.pagination.pageSize !== limit) {
              setLimit(state.pagination.pageSize);
              setPage(1);
            }
            if (state.globalFilter !== search) {
              setSearch(state.globalFilter || "");
              setPage(1);
            }
          }}
          features={{
            // Infinite scroll. Polled progress stays current only because
            // every refresh restarts it from batch 1 (listRefresh.reload).
            pagination: true,
            // One fixed batch size, so no "Baris" menu (boss, 29 Oct meeting:
            // no rows-per-page here).
            pageSizeOptions: [BATCH_SIZE],
            globalFilter: true,
            columnFilters: false,
            sorting: false,
            rowSelection: "none",
            columnVisibility: true,
            densityToggle: true,
            fullScreenToggle: false,
          }}
          renderTopLeftToolbar={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AppButton
                variantStyle="outline"
                onClick={() => void listRefresh.reload()}
                startIcon={<RefreshCw size={16} className={isFetching || listRefresh.isRefreshing ? "animate-spin" : ""} />}
              >
                Refresh
              </AppButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Auto-refresh:
                </Typography>
                <Select
                  size="small"
                  value={!mounted ? 5000 : (refetchInterval === false ? 0 : refetchInterval)}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  sx={{
                    minWidth: 160,
                    height: 36,
                    backgroundColor: 'white',
                    '.MuiSelect-select': { py: 0.5 }
                  }}
                >
                  {INTERVAL_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          )}
        />
      </DialogContent>

      <ImportDuplicateDialog
        module={module}
        job={reviewJob}
        onClose={() => setReviewJob(null)}
        onAnswered={() => void listRefresh.reload()}
      />
    </Dialog>
  );
};

export default ImportHistoryModal;

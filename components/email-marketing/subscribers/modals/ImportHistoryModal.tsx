"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Stack, Chip, Tooltip } from "@mui/material";
import { X, RefreshCw, StopCircle, PlayCircle, RotateCcw } from "lucide-react";
import { SuperTable } from "@/components/ui/super-table";
import type { MRT_ColumnDef } from "@/components/ui/super-table/types";
import { useBulkJobs, useActionBulkJob } from "@/lib/hooks/useSubscribers";
import { BulkJob } from "@/lib/types/email-marketing";
import { AppButton } from "@/components/ui/app-button";
import { format } from "date-fns";
import { notify } from "@/lib/notifications";

interface ImportHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ open, onClose }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useBulkJobs(page, limit, search, ["subscriber", "contact"]);
  const actionMutation = useActionBulkJob();

  const handleAction = (jobId: string, action: 'stop' | 'continue' | 'rollback' | 'replay') => {
    actionMutation.mutate(
      { jobId, action },
      {
        onSuccess: () => {
          notify.success(`Action ${action} triggered successfully.`);
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
  const totalCount = data?.data?.total || 0;

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
          const { total_rows, processed_rows, created_rows, skipped_rows, failed_rows } = row.original;
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: "0.875rem" }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Processed: {processed_rows} / {total_rows}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <span className="text-green-600">Created: {created_rows}</span>
                <span className="text-gray-500">Skipped: {skipped_rows}</span>
                <span className="text-red-600">Failed: {failed_rows}</span>
              </Box>
            </Box>
          );
        },
      },
      {
        accessorKey: "target",
        header: "Target",
        Cell: ({ cell }) => <span className="capitalize">{cell.getValue<string>()?.replace("_", " ")}</span>,
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
        header: "Action",
        Cell: ({ row }) => {
          const job = row.original;
          const status = job.status;

          const renderButton = (action: 'stop' | 'continue' | 'rollback' | 'replay', icon: React.ReactNode, tooltip: string, color: string) => (
            <Tooltip title={tooltip} placement="top" arrow>
              <IconButton
                size="small"
                onClick={() => handleAction(job.id, action)}
                disabled={actionMutation.isPending}
                sx={{ color }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          );

          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {(status === 'Queued for Processing' || status === 'Processing') &&
                renderButton('stop', <StopCircle size={18} />, 'Stop Job', '#ef4444')}

              {status === 'Stopped' &&
                renderButton('continue', <PlayCircle size={18} />, 'Continue Job', '#3b82f6')}

              {(status === 'Stopped' || status === 'Completed') &&
                renderButton('rollback', <RotateCcw size={18} />, 'Rollback Job', '#eab308')}

              {(status === 'Failed' || status === 'Rolled Back') &&
                renderButton('replay', <RefreshCw size={18} />, 'Replay Job', '#10b981')}
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
            Import History
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
          tableId="import-history-table"
          data={bulkJobs}
          columns={columns}
          rowCount={totalCount}
          isLoading={isLoading || isFetching}
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
          initialState={{
            pagination: {
              pageIndex: 0,
              pageSize: 10,
            },
          }}
          features={{
            pagination: true,
            globalFilter: true,
            globalFilterAlwaysVisible: true,
            columnFilters: false,
            sorting: false,
            rowSelection: "none",
            columnVisibility: true,
            densityToggle: true,
            fullScreenToggle: false,
          }}
          renderTopLeftToolbar={() => (
            <AppButton
              variantStyle="outline"
              onClick={() => refetch()}
              startIcon={<RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />}
            >
              Refresh
            </AppButton>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImportHistoryModal;

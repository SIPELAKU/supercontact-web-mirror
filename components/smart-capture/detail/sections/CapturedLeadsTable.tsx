import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Chip } from '@mui/material';
import { Calendar, Save, Trash2, Inbox, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table/types';
import {
  useSmartCaptureSubmissions,
  useResendSmartCaptureSubmission,
  useDeleteSmartCaptureSubmissions,
} from '@/lib/hooks/useSmartCaptureSubmissions';
import { SmartCaptureSubmission, EmailStatus, PhoneStatus } from '@/lib/models/types';
import { AppButton } from '@/components/ui/app-button';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { SaveAsModal } from '@/components/modal/SaveAsModal';
import { notify } from '@/lib/notifications';

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
// ... existing status config ...
  // Email Statuses
  opened: { bg: '#DCFCE7', text: '#16A34A' },    // Green
  pending: { bg: '#FEF9C3', text: '#A16207' },   // Yellow
  bounced: { bg: '#FEE2E2', text: '#EF4444' },   // Red
  clicked: { bg: '#EEF2FF', text: '#6366F1' },   // Purple/Indigo
  delivered: { bg: '#E0F2FE', text: '#0EA5E9' }, // Light Blue
  failed: { bg: '#FEF2F2', text: '#991B1B' },    // Dark Red
  sent: { bg: '#EFF6FF', text: '#2563EB' },       // Blue
  // Phone Statuses
  valid: { bg: '#DCFCE7', text: '#16A34A' },     // Green
  invalid: { bg: '#FEE2E2', text: '#EF4444' },    // Red
  // Fallback
  unknown: { bg: '#F1F5F9', text: '#64748B' },   // Gray
  default: { bg: '#F1F5F9', text: '#64748B' },   // Gray
};

export const CapturedLeadsTable = () => {
  const params = useParams();
  const id = params.id as string;

  const [tableParams, setTableParams] = useState<{
    page: number;
    limit: number;
    search: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);
  const [resendingSubmissionId, setResendingSubmissionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);

  const { data: response, isLoading, isFetching, isError, error, refetch } = useSmartCaptureSubmissions(id, tableParams);
  const resendMutation = useResendSmartCaptureSubmission();
  const deleteMutation = useDeleteSmartCaptureSubmissions();

  const submissions = response?.data?.submissions || [];
  const totalCount = response?.data?.total || 0;

  const handleResend = async (submission: SmartCaptureSubmission) => {
    setResendingSubmissionId(submission.id);
    try {
      await resendMutation.mutateAsync({ smartCaptureId: id, submissionId: submission.id });
      notify.success(`Resend for "${submission.email}" has been queued.`);
      // The actual send happens in a background job, so give it a moment
      // before refreshing the row's status.
      setTimeout(() => refetch(), 3000);
    } catch (err: any) {
      notify.error(err.message || 'Failed to resend email.');
    } finally {
      setResendingSubmissionId(null);
    }
  };

  const handleDeleteRequest = (submission: SmartCaptureSubmission) => {
    setDeleteTarget({ ids: [submission.id], label: submission.email });
  };

  const handleBulkDeleteRequest = (selectedRows: SmartCaptureSubmission[], clearSelection: () => void) => {
    setClearSelectionFn(() => clearSelection);
    setDeleteTarget({
      ids: selectedRows.map((r) => r.id),
      label: `${selectedRows.length} leads`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ smartCaptureId: id, submissionIds: deleteTarget.ids });
      notify.success(
        deleteTarget.ids.length > 1
          ? `${deleteTarget.ids.length} leads deleted successfully.`
          : `"${deleteTarget.label}" deleted successfully.`
      );
      if (clearSelectionFn) {
        clearSelectionFn();
        setClearSelectionFn(null);
      }
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete lead(s).');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStateChange = (state: SuperTableState) => {
    const sort = state.sorting?.[0];
    setTableParams((prev) => ({
      ...prev,
      page: state.pagination.pageIndex + 1,
      limit: state.pagination.pageSize,
      search: state.globalFilter || '',
      sort_by: sort?.id,
      sort_order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
    }));
  };

  const columns = useMemo<MRT_ColumnDef<SmartCaptureSubmission>[]>(
    // ... columns config ...
    () => [
      {
        accessorKey: 'name',
        header: 'Leads Name',
        Cell: ({ cell, row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
            <span className="text-xs text-gray-400 font-mono tracking-tight">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
        Cell: ({ cell }) => <span className="text-gray-600 font-mono text-[13px]">{cell.getValue<string>()}</span>,
      },
      {
        accessorKey: 'email_status',
        header: 'Email Status',
        Cell: ({ cell }) => {
          const status = (cell.getValue<EmailStatus>() || 'unknown').toLowerCase();
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
          
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{
                bgcolor: config.bg,
                color: config.text,
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.65rem',
                textTransform: 'capitalize',
                border: `1px solid ${config.text}20`,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'phone_status',
        header: 'Phone Status',
        Cell: ({ cell }) => {
          const status = (cell.getValue<PhoneStatus>() || 'unknown').toLowerCase();
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
          
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{
                bgcolor: config.bg,
                color: config.text,
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.65rem',
                textTransform: 'capitalize',
                border: `1px solid ${config.text}20`,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'error_message',
        header: 'Error Message',
        Cell: ({ cell }) => (
          <span className="text-red-500 font-medium text-[13px]">
            {cell.getValue<string>() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'captured_at',
        header: 'Captured',
        Cell: ({ cell }) => (
          <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
            <Calendar size={14} className="opacity-70" />
            <span>{format(new Date(cell.getValue<string>()), 'dd MMM yyyy, HH:mm')}</span>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">Recent Captured Leads</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
             Submissions
          </span>
        </div>
        <div className="p-1">
          <SuperTable<SmartCaptureSubmission>
            entityLabel="lead"
            searchPlaceholder="Cari nama atau email lead"
            tableId="captured-leads-table"
            urlKey="leads"
            data={submissions}
            columns={columns}
            rowCount={totalCount}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
            renderEmptyState={() => (
              <EmptyState
                icon={Inbox}
                title="No captured leads yet"
                description="Leads submitted through this magnet's form will appear here."
              />
            )}
            manualPagination={true}
            manualSorting={true}
            manualFiltering={true}
            onStateChange={handleStateChange}
            initialState={{
              pagination: {
                pageIndex: tableParams.page - 1,
                pageSize: tableParams.limit,
              },
              globalFilter: tableParams.search,
            }}
            features={{
          urlSync: true,
              pagination: true,
              globalFilter: true,
              columnFilters: false,
              sorting: true,
              rowSelection: 'multi',
              columnVisibility: false,
              densityToggle: false,
              fullScreenToggle: false,
              export: { excel: false, csv: false },
            }}
            rowActions={(submission) => {
              const emailStatus = (submission.email_status || '').toLowerCase();
              const isFailed = emailStatus === 'failed';
              // A pending older than 30 minutes is an orphaned delivery (its
              // in-process send task was killed by an API restart and nothing
              // will ever move it) - the backend accepts resends for it, so
              // surface the same action. Mirrors STALE_PENDING_RESEND_THRESHOLD
              // in smart_capture_service.py.
              const isStalePending =
                emailStatus === 'pending' &&
                !!submission.captured_at &&
                Date.now() - new Date(submission.captured_at).getTime() > 30 * 60 * 1000;
              return [
                {
                  id: 'resend',
                  label: isStalePending
                    ? 'Delivery stuck in pending - resend email'
                    : 'Resend email',
                  icon: <RotateCw size={16} />,
                  hidden: () => !(isFailed || isStalePending),
                  isLoading: () => resendingSubmissionId === submission.id,
                  onClick: (row) => handleResend(row),
                },
                {
                  id: 'delete',
                  label: 'Delete lead',
                  icon: <Trash2 size={16} />,
                  destructive: true,
                  onClick: (row) => handleDeleteRequest(row),
                },
              ];
            }}
            renderBulkActions={({ selectedRows, clearSelection }) => (
              <div className="flex gap-2 items-center">
                <AppButton
                  variantStyle="primary"
                  color="success"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    setSelectedIds(selectedRows.map(r => r.id));
                    setClearSelectionFn(() => clearSelection);
                    setIsSaveAsModalOpen(true);
                  }}
                >
                  Save As
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="danger"
                  startIcon={<Trash2 size={16} />}
                  onClick={() => handleBulkDeleteRequest(selectedRows, clearSelection)}
                >
                  Delete ({selectedRows.length})
                </AppButton>
              </div>
            )}
          />
        </div>
      </div>

      <SaveAsModal
        open={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        selectedIds={selectedIds}
        sourceType="submission"
        smartCaptureId={id}
        onSuccess={() => {
          if (clearSelectionFn) clearSelectionFn();
          refetch();
        }}
      />

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget && deleteTarget.ids.length > 1 ? `Delete (${deleteTarget.ids.length})` : 'Delete Lead'}
        description={
          deleteTarget
            ? deleteTarget.ids.length > 1
              ? `Are you sure you want to delete these ${deleteTarget.ids.length} leads? This action cannot be undone.`
              : `Are you sure you want to delete "${deleteTarget.label}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

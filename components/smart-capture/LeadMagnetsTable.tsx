"use client";

import { SmartCapture, SmartCaptureStatus } from '@/lib/models/types';
import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table/types';
import { AppButton } from '../ui/app-button';
import Link from 'next/link';
import { DeleteButton, DuplicateButton, EditButton } from '../ui/app-action-buttons-table';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Eye, FileText, Plus, ChevronDown, Trash2, Copy, Edit3, RefreshCcw } from 'lucide-react';
import { Box, Chip, IconButton, Tooltip, Menu, MenuItem, CircularProgress } from '@mui/material';
import {
  useUpdateSmartCaptureStatus,
  useDeleteMultipleSmartCaptures,
  useDuplicateSmartCaptures
} from '@/lib/hooks/useSmartCaptures';
import { notify } from '@/lib/notifications';
import { BulkUpdateStatusModal } from '../modal/BulkUpdateStatusModal';
import { ConfirmationPopup } from '../ui/confirmation-popup';

export interface LeadMagnet extends Partial<SmartCapture> {
  id: string;
  name: string;
  status: SmartCaptureStatus;
  views: number;
  valid_leads: number;
  conversion?: number;
}

interface LeadMagnetsTableProps {
  data: SmartCapture[];
  rowCount?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onStateChange?: (state: SuperTableState) => void;
  initialState?: any;
}

const StatusCell = ({ row }: { row: SmartCapture }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mutate, isPending } = useUpdateSmartCaptureStatus();

  const status = row.status;
  const isActive = status === 'Active';
  const isDraft = status === 'Draft';
  const isInactive = status === 'Inactive';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // if (isActive) {
    //   notify.info("Active campaigns are locked and cannot be changed here.");
    //   return;
    // }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: SmartCaptureStatus) => {
    mutate({ ids: [row.id], status: newStatus }, {
      onSuccess: () => {
        notify.success(`Status updated to ${newStatus}`);
        handleClose();
      },
      onError: (err: any) => {
        notify.error(err.message || "Failed to update status");
      }
    });
  };

  return (
    <>
      <Chip
        label={isPending ? "Updating..." : status}
        size="small"
        onClick={handleClick}
        icon={!isPending ? <ChevronDown size={14} /> : undefined}
        disabled={isPending}
        sx={{
          bgcolor: isActive ? '#DCFCE7' : isDraft ? '#F1F5F9' : '#FEE2E2',
          color: isActive ? '#16A34A' : isDraft ? '#64748B' : '#EF4444',
          fontWeight: 600,
          borderRadius: '6px',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: isActive ? '#DCFCE7' : isDraft ? '#E2E8F0' : '#FECACA',
          },
          transition: 'all 0.2s',
          '.MuiChip-icon': {
            color: 'inherit',
            ml: 0.5,
            mr: -0.5,
          }
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            border: '1px solid #F1F5F9',
            minWidth: '140px',
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {!isActive && (
          <MenuItem
            onClick={() => handleStatusChange('Active')}
            sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#16A34A', '&:hover': { bgcolor: '#DCFCE7/50' } }}
          >
            Set as Active
          </MenuItem>
        )}
        {!isInactive && (
          <MenuItem
            onClick={() => handleStatusChange('Inactive')}
            sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2/50' } }}
          >
            Set as Inactive
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const LeadMagnetsTable = ({
  data,
  rowCount = 0,
  isLoading = false,
  isFetching = false,
  onStateChange,
  initialState
}: LeadMagnetsTableProps) => {
  const router = useRouter();

  const { mutate: duplicateMutate, isPending: isDuplicating } = useDuplicateSmartCaptures();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteMultipleSmartCaptures();

  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; clearSelection?: () => void } | null>(null);

  const handleDuplicate = (ids: string[], clearSelection?: () => void) => {
    duplicateMutate(ids, {
      onSuccess: () => {
        notify.success(`Successfully duplicated ${ids.length} item(s)`);
        if (clearSelection) clearSelection();
      },
      onError: (err: any) => notify.error(err.message || "Failed to duplicate")
    });
  };

  const handleDelete = (ids: string[], clearSelection?: () => void) => {
    setDeleteTarget({ ids, clearSelection });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { ids, clearSelection } = deleteTarget;
    deleteMutate(ids, {
      onSuccess: () => {
        notify.success(`Successfully deleted ${ids.length} item(s)`);
        if (clearSelection) clearSelection();
        setDeleteTarget(null);
      },
      onError: (err: any) => notify.error(err.message || "Failed to delete")
    });
  };

  const columns = useMemo<MRT_ColumnDef<SmartCapture>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Magnet',
        Cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-500 rounded-md">
              <FileText size={16} />
            </div>
            <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ row }) => <StatusCell row={row.original} />,
      },
      {
        accessorKey: 'views',
        header: 'Views',
        Cell: ({ cell }) => <span className="text-gray-700">{cell.getValue<number>()}</span>,
      },
      {
        accessorKey: 'valid_leads',
        header: 'Leads Valid',
        Cell: ({ cell }) => <span className="text-blue-600 font-medium">{cell.getValue<number>()}</span>,
      },
      {
        id: 'conversion',
        header: 'Konversi',
        // accessorFn: (row) => (row as any).conversion ?? 0,
        accessorKey: 'conversions',
        Cell: ({ cell }) => <span className="text-gray-700">{cell.getValue<number>()}%</span>,
      },
    ],
    []
  );

  return (
    <>
      <SuperTable<SmartCapture>
        tableId="lead-magnets-table"
        data={data}
        columns={columns}
        rowCount={rowCount}
        isLoading={isLoading}
        isFetching={isFetching || isDuplicating || isDeleting}
        manualPagination={true}
        manualSorting={true}
        manualFiltering={true}
        onStateChange={onStateChange}
        initialState={initialState || {
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
          sorting: true,
          rowSelection: 'multi',
          columnVisibility: false,
          densityToggle: false,
          fullScreenToggle: false,
          export: { excel: false, csv: false },
          urlSync: false,
        }}
        onRowClick={(row, event) => {
          console.log("clicked");
          // Prevent navigation if clicking on interactive elements like chips or buttons
          const target = event.target as HTMLElement;
          if (target.closest('button') || target.closest('.MuiChip-root')) {
            return;
          }

          const path = row.status === 'Draft'
            ? `/smart-capture/edit/${row.id}`
            : `/smart-capture/detail/${row.id}`;
          router.push(path);
        }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <DuplicateButton onClick={() => handleDuplicate([row.original.id])} />
            <DeleteButton onClick={() => handleDelete([row.original.id])} />
          </Box>
        )}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <div className="flex gap-2 items-center">
            <AppButton
              variantStyle="primary"
              startIcon={<Copy size={16} />}
              disabled={isDuplicating}
              onClick={() => handleDuplicate(selectedRows.map(r => r.id), clearSelection)}
            >
              Duplicate ({selectedRows.length})
            </AppButton>
            <AppButton
              variantStyle="soft"
              startIcon={<RefreshCcw size={16} />}
              onClick={() => {
                setSelectedBulkIds(selectedRows.map(r => r.id));
                setClearSelectionFn(() => clearSelection);
                setIsBulkStatusModalOpen(true);
              }}
            >
              Update Status ({selectedRows.length})
            </AppButton>
            <AppButton
              variantStyle="danger"
              startIcon={<Trash2 size={16} />}
              disabled={isDeleting}
              onClick={() => handleDelete(selectedRows.map(r => r.id), clearSelection)}
            >
              Delete ({selectedRows.length})
            </AppButton>
          </div>
        )}
        renderTopLeftToolbar={() => (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-2">
              <Link href="/smart-capture/create">
                <AppButton
                  variantStyle="primary"
                  startIcon={<Plus size={16} />}
                >
                  Add New Magnet
                </AppButton>
              </Link>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden gap-2">
              <Link href="/smart-capture/create">
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                  title="Add New Magnet"
                >
                  <Plus size={16} />
                </button>
              </Link>
            </div>
          </>
        )}
      />
      <BulkUpdateStatusModal
        open={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        selectedIds={selectedBulkIds}
        onSuccess={() => {
          if (clearSelectionFn) clearSelectionFn();
        }}
      />
      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.ids.length ?? 0} item(s)?`}
        description={`Are you sure you want to delete ${deleteTarget?.ids.length ?? 0} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default LeadMagnetsTable;

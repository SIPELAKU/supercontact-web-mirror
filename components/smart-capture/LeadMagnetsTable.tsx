"use client";

import { useMemo } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Eye, FileText, MoreVertical, Plus } from 'lucide-react';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '../ui/app-button';
import Link from 'next/link';
import { DeleteButton, DuplicateButton, EditButton } from '../ui/app-action-buttons-table';

export interface LeadMagnet {
  id: string;
  name: string;
  status: 'Active' | 'Draft';
  views: number;
  leadsValid: number;
  conversion: number;
}

interface LeadMagnetsTableProps {
  data: LeadMagnet[];
}

const LeadMagnetsTable = ({ data }: LeadMagnetsTableProps) => {
  const columns = useMemo<MRT_ColumnDef<LeadMagnet>[]>(
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
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const isActive = status === 'Active';
          return (
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: isActive ? '#DCFCE7' : '#F1F5F9',
                color: isActive ? '#16A34A' : '#64748B',
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          );
        },
      },
      {
        accessorKey: 'views',
        header: 'Views',
        Cell: ({ cell }) => <span className="text-gray-700">{cell.getValue<number>()}</span>,
      },
      {
        accessorKey: 'leadsValid',
        header: 'Leads Valid',
        Cell: ({ cell }) => <span className="text-blue-600 font-medium">{cell.getValue<number>()}</span>,
      },
      {
        accessorKey: 'conversion',
        header: 'Konversi',
        Cell: ({ cell }) => <span className="text-gray-700">{cell.getValue<number>()}%</span>,
      },
    ],
    []
  );

  return (
    <SuperTable<LeadMagnet>
      tableId="lead-magnets-table"
      data={data}
      columns={columns}
      rowCount={data.length}
      isLoading={false}
      manualPagination={false}
      manualSorting={false}
      manualFiltering={false}
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
        sorting: true,
        rowSelection: 'none',
        columnVisibility: false,
        densityToggle: false,
        fullScreenToggle: false,
        export: { excel: false, csv: false },
        urlSync: false,
      }}
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // setPreviewRecipient(row.original);
              }}
              sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
            >
              <Eye size={18} />
            </IconButton>
          </Tooltip>
          <EditButton onClick={() => {
            // onEdit(row.original)
          }} />
          <DuplicateButton onClick={() => {
            // onDuplicate && onDuplicate([row.original.id], 'recipient')
          }} />
          <DeleteButton onClick={() => {
            // onDeleteRequest([row.original.id])
          }} />
        </Box>
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
  );
};

export default LeadMagnetsTable;

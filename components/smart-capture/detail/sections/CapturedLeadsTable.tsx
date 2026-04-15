"use client";

import { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import { User, Mail, Phone, Calendar } from 'lucide-react';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Validated' | 'Pending';
  capturedAt: string;
}

const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Ahmad Faisal', email: 'ahmad.f@example.com', phone: '+628123456789', status: 'Validated', capturedAt: '2026-04-13 14:20' },
  { id: 'l2', name: 'Siti Aminah', email: 'siti.a@gmail.com', phone: '+628122233344', status: 'Validated', capturedAt: '2026-04-13 11:05' },
  { id: 'l3', name: 'Budi Santoso', email: 'budiS@outlook.com', phone: '+628133344455', status: 'Pending', capturedAt: '2026-04-12 16:45' },
  { id: 'l4', name: 'Dewi Lestari', email: 'dewi.les@perusahaan.co.id', phone: '+62811122233', status: 'Validated', capturedAt: '2026-04-12 09:12' },
  { id: 'l5', name: 'Rizki Pratama', email: 'rizki.p@startup.id', phone: '+628199988877', status: 'Validated', capturedAt: '2026-04-11 15:30' },
];

export const CapturedLeadsTable = () => {
  const columns = useMemo<MRT_ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Leads Name',
        Cell: ({ cell, row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
            <span className="text-xs text-gray-500">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        Cell: ({ cell }) => <span className="text-gray-700 font-mono text-sm">{cell.getValue<string>()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const isValidated = status === 'Validated';
          return (
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: isValidated ? '#DCFCE7' : '#FEF9C3',
                color: isValidated ? '#16A34A' : '#A16207',
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.7rem',
              }}
            />
          );
        },
      },
      {
        accessorKey: 'capturedAt',
        header: 'Captured At',
        Cell: ({ cell }) => (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Calendar size={14} />
            <span>{cell.getValue<string>()}</span>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Captured Leads</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
           Last 30 Days
        </span>
      </div>
      <div className="p-1">
        <SuperTable<Lead>
          tableId="captured-leads-table"
          data={MOCK_LEADS}
          columns={columns}
          rowCount={MOCK_LEADS.length}
          isLoading={false}
          manualPagination={false}
          manualSorting={false}
          manualFiltering={false}
          initialState={{
            pagination: {
              pageIndex: 0,
              pageSize: 5,
            },
          }}
          features={{
            pagination: true,
            globalFilter: false,
            columnFilters: false,
            sorting: true,
            rowSelection: 'none',
            columnVisibility: false,
            densityToggle: false,
            fullScreenToggle: false,
            export: { excel: false, csv: false },
            urlSync: false,
          }}
        />
      </div>
    </div>
  );
};

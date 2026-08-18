"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { AppButton } from '@/components/ui/app-button';
import LeadMagnetsTable from './LeadMagnetsTable';
import PageHeader from '../ui/page-header';
import { useSmartCaptures } from '@/lib/hooks/useSmartCaptures';
import { SuperTableState } from '@/components/ui/super-table/types';
import { Tabs, Tab, Box, Badge, Chip } from '@mui/material';

export default function SmartCaptureClient() {
  const [tabIndex, setTabIndex] = useState(0);
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status: string;
    target: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    target: '',
    sort_by: undefined,
    sort_order: undefined,
  });

  // Query for Active campaigns
  const { data: activeRes, isLoading: activeLoading, isFetching: activeFetching } = useSmartCaptures({
    ...params,
    status: 'Active'
  });

  // Query for Inactive campaigns (Draft + Inactive)
  const { data: inactiveRes, isLoading: inactiveLoading, isFetching: inactiveFetching } = useSmartCaptures({
    ...params,
    status: ['Draft', 'Inactive']
  });

  const handleStateChange = (state: SuperTableState) => {
    const sort = state.sorting?.[0];
    setParams((prev) => ({
      ...prev,
      page: state.pagination.pageIndex + 1,
      limit: state.pagination.pageSize,
      search: state.globalFilter,
      sort_by: sort?.id,
      sort_order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
    }));
  };

  const handleTabChange = (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    setParams(prev => ({ ...prev, page: 1 })); // Reset page on tab switch
  };

  const activeCount = activeRes?.data?.total || 0;
  const inactiveCount = inactiveRes?.data?.total || 0;

  const currentData = tabIndex === 0 ? activeRes : inactiveRes;
  const currentLoading = tabIndex === 0 ? activeLoading : inactiveLoading;
  const currentFetching = tabIndex === 0 ? activeFetching : inactiveFetching;

  const stats = currentData?.data?.stats;
  const totalViews = stats?.total_views || 0;
  const totalLeads = stats?.total_valid_leads || 0;
  const conversionRate = totalViews > 0
    ? ((totalLeads / totalViews) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Lead Magnets"
          description="Manage your forms and soft-selling assets to get validated prospects."
          breadcrumbs={[
            {
              label: "Smart Capture",
              href: "/smart-capture",
            },
          ]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Views</h3>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat().format(totalViews)}
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Validated Leads</h3>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat().format(totalLeads)}
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg. Conversion Rate</h3>
          <p className="text-3xl font-bold text-[#16A34A]">
            {conversionRate}%
          </p>
        </div>

      </div>

      {/* Tabs and Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 overflow-hidden">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minWidth: 100,
                py: 2,
              },
              '& .Mui-selected': {
                color: '#5479EE !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#5479EE',
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Active
                  <Chip
                    label={activeCount}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '10px',
                      fontWeight: 700,
                      bgcolor: tabIndex === 0 ? '#EEF2FF' : '#F8FAFC',
                      color: tabIndex === 0 ? '#5479EE' : '#94A3B8',
                      transition: 'all 0.2s'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Inactive
                  <Chip
                    label={inactiveCount}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '10px',
                      fontWeight: 700,
                      bgcolor: tabIndex === 1 ? '#EEF2FF' : '#F8FAFC',
                      color: tabIndex === 1 ? '#5479EE' : '#94A3B8',
                      transition: 'all 0.2s'
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>

        <LeadMagnetsTable
          data={currentData?.data?.smart_captures || []}
          rowCount={currentData?.data?.total || 0}
          isLoading={currentLoading}
          isFetching={currentFetching}
          onStateChange={handleStateChange}
          initialState={{
            pagination: {
              pageIndex: params.page - 1,
              pageSize: params.limit,
            },
            globalFilter: params.search,
          }}
        />
      </div>

    </div>
  );
}

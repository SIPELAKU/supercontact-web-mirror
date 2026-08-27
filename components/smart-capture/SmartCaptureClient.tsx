"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { AppButton } from '@/components/ui/app-button';
import LeadMagnetsTable from './LeadMagnetsTable';
import PageHeader from '../ui/page-header';
import { useSmartCaptures } from '@/lib/hooks/useSmartCaptures';
import { SuperTableState } from '@/components/ui/super-table/types';
import { Box, Chip } from '@mui/material';
import { AppTabs } from '@/components/ui/app-tabs';

type CaptureTab = 'active' | 'inactive';
const VALID_TABS: CaptureTab[] = ['active', 'inactive'];


// Rebuilding the URL from a template silently discards every OTHER query
// param - the table's own ?p / ?q / ?sort included - so switching tabs threw
// away the page and search the user had set. Merge instead of replace.
function withTab(pathname: string, current: URLSearchParams, tab: string) {
  const params = new URLSearchParams(current.toString());
  params.set("tab", tab);
  return `${pathname}?${params.toString()}`;
}

export default function SmartCaptureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CaptureTab>(() => {
    const fromUrl = searchParams.get('tab') as CaptureTab | null;
    return fromUrl && VALID_TABS.includes(fromUrl) ? fromUrl : 'active';
  });
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
  const { data: activeRes, isLoading: activeLoading, isFetching: activeFetching, isError: activeError, error: activeErrorObj, refetch: refetchActive } = useSmartCaptures({
    ...params,
    status: 'Active'
  });

  // Query for Inactive campaigns (Draft + Inactive)
  const { data: inactiveRes, isLoading: inactiveLoading, isFetching: inactiveFetching, isError: inactiveError, error: inactiveErrorObj, refetch: refetchInactive } = useSmartCaptures({
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

  const handleTabChange = (tab: CaptureTab) => {
    setActiveTab(tab);
    setParams(prev => ({ ...prev, page: 1 })); // Reset page on tab switch
    router.replace(withTab(`/smart-capture`, searchParams, tab), { scroll: false });
  };

  const activeCount = activeRes?.data?.total || 0;
  const inactiveCount = inactiveRes?.data?.total || 0;

  const isActiveTab = activeTab === 'active';
  const currentData = isActiveTab ? activeRes : inactiveRes;
  const currentLoading = isActiveTab ? activeLoading : inactiveLoading;
  const currentFetching = isActiveTab ? activeFetching : inactiveFetching;
  const currentIsError = isActiveTab ? activeError : inactiveError;
  const currentError = isActiveTab ? activeErrorObj : inactiveErrorObj;
  const currentRefetch = isActiveTab ? refetchActive : refetchInactive;

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
          title="Smart Capture"
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
        <Box sx={{ px: 2, pt: 1 }}>
          <AppTabs<CaptureTab>
            value={activeTab}
            onChange={handleTabChange}
            tabs={[
              {
                value: 'active',
                label: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Active
                    <Chip
                      label={activeCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '10px',
                        fontWeight: 700,
                        bgcolor: isActiveTab ? '#EEF2FF' : '#F8FAFC',
                        color: isActiveTab ? '#5479EE' : '#94A3B8',
                        transition: 'all 0.2s'
                      }}
                    />
                  </Box>
                ),
              },
              {
                value: 'inactive',
                label: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Inactive
                    <Chip
                      label={inactiveCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '10px',
                        fontWeight: 700,
                        bgcolor: !isActiveTab ? '#EEF2FF' : '#F8FAFC',
                        color: !isActiveTab ? '#5479EE' : '#94A3B8',
                        transition: 'all 0.2s'
                      }}
                    />
                  </Box>
                ),
              },
            ]}
          />
        </Box>

        <LeadMagnetsTable
          data={currentData?.data?.smart_captures || []}
          rowCount={currentData?.data?.total || 0}
          isLoading={currentLoading}
          isFetching={currentFetching}
          isError={currentIsError}
          errorMessage={currentError instanceof Error ? currentError.message : undefined}
          onRetry={() => currentRefetch()}
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

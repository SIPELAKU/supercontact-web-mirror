"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { AppButton } from '@/components/ui/app-button';
import LeadMagnetsTable from './LeadMagnetsTable';
import PageHeader from '../ui/page-header';
import { useSmartCaptures } from '@/lib/hooks/useSmartCaptures';
import { SuperTableState } from '@/components/ui/super-table/types';

export default function SmartCaptureClient() {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    target: '',
  });

  const { data: response, isLoading, isFetching } = useSmartCaptures(params);

  const handleStateChange = (state: SuperTableState) => {
    setParams((prev) => ({
      ...prev,
      page: state.pagination.pageIndex + 1,
      limit: state.pagination.pageSize,
      search: state.globalFilter,
      // For status and target, if column filters were enabled:
      // status: state.columnFilters.find(f => f.id === 'status')?.value as string || '',
      // target: state.columnFilters.find(f => f.id === 'target')?.value as string || '',
    }));
  };

  const smartCaptures = response?.data?.smart_captures || [];
  const totalCount = response?.data?.total || 0;
  const stats = response?.data?.stats;

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

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <LeadMagnetsTable 
          data={smartCaptures} 
          rowCount={totalCount}
          isLoading={isLoading}
          isFetching={isFetching}
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

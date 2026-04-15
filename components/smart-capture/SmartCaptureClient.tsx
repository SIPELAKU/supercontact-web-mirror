"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { AppButton } from '@/components/ui/app-button';
import LeadMagnetsTable, { LeadMagnet } from './LeadMagnetsTable';
import PageHeader from '../ui/page-header';

// Mock Data
const MOCK_LEAD_MAGNETS: LeadMagnet[] = [
  { id: '1', name: 'Template SOP Sales 2026', status: 'Active', views: 342, leadsValid: 89, conversion: 26 },
  { id: '2', name: 'E-book: Cold Calling Script', status: 'Draft', views: 150, leadsValid: 12, conversion: 8 },
  { id: '3', name: 'Kalkulator ROI B2B', status: 'Active', views: 890, leadsValid: 410, conversion: 46 },
];

export default function SmartCaptureClient() {
  const [data] = useState<LeadMagnet[]>(MOCK_LEAD_MAGNETS);

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
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Views</h3>
          <p className="text-3xl font-bold text-gray-900">1,382</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Validated Leads</h3>
          <p className="text-3xl font-bold text-gray-900">511</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg. Conversion Rate</h3>
          <p className="text-3xl font-bold text-[#16A34A]">36.9%</p>
        </div>

      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <LeadMagnetsTable data={data} />
      </div>

    </div>
  );
}

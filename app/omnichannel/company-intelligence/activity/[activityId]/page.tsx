"use client";

import { ActivitySidebar, CompanyActivityStatCard, RecentActivityCompany } from "@/components/omnichannel";
import PageHeader from "@/components/ui-mui/page-header";
import { Button } from "@mui/material";
import { ArrowLeft, FileText, Linkedin, TrendingDown, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyActivityPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <Button variant="outlined" className="capitalize! rounded-lg!" onClick={() => router.push("/omnichannel/company-intelligence/1")}>
        <ArrowLeft className="w-3 h-3 mr-1" />
        Back
      </Button>

      <PageHeader title="Company Activity" breadcrumbs={[{ label: "Omnichannel" }, { label: "Acme Inc." }, { label: "Company Activity" }]} className="mt-10" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyActivityStatCard title="Total Posts" value="1,248" trend="up" trendValue="+12.5%" description="vs last month" icon={<FileText className="h-4 w-4 text-blue-600" />} />

        <CompanyActivityStatCard title="Avg. Engagement" value="4.8%" trend="down" trendValue="-2.1%" description="vs last month" icon={<TrendingDown className="h-4 w-4 text-purple-600" />} />

        <CompanyActivityStatCard title="Top Channel" value="LinkedIn" description="68% of total volume" icon={<Linkedin className="h-4 w-4 text-blue-700" />} />

        <CompanyActivityStatCard title="Audience Growth" value="+854" trend="up" trendValue="+5.4%" description="new followers" icon={<Users className="h-4 w-4 text-green-600" />} />
      </div>

      <div className="mt-5 grid grid-cols-12 gap-6">
        {/* Sidebar — MOBILE ON TOP */}
        <div className="order-1 col-span-12 lg:order-2 lg:col-span-3 flex flex-col gap-6">
          <ActivitySidebar />
        </div>

        {/* Main content */}
        <div className="order-2 col-span-12 lg:order-1 lg:col-span-9 flex flex-col gap-6">
          <RecentActivityCompany />
        </div>
      </div>
    </div>
  );
}

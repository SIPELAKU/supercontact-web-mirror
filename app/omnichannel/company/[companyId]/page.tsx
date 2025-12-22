"use client";

import { AiIntelligenceSummary, CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard, OrganizationStructureCard, RecentSignals, SimiliarCompaniesCard } from "@/components/omnichannel";
import RecentActivityCompany from "@/components/omnichannel/company/detail-company/RecentActivityDetailCompany";
import PageHeader from "@/components/ui-mui/page-header";
import { aiSummary } from "@/lib/data/ai-summary";
import { company } from "@/lib/data/detail-company";
import { RECENT_ACTIVITY_DETAIL_COMPANY } from "@/lib/data/recent-activity-detail-company";
import { RECENT_SIGNALS } from "@/lib/data/recent-signals";
import { useState } from "react";

export default function DetailCompanyPage() {
  const [isLoading, setIsloading] = useState<boolean>(false);

  return (
    <div className="p-6">
      <PageHeader title="Acme Inc." breadcrumbs={[{ label: "Omnichannel" }, { label: "Acme Inc." }]} />

      <AiIntelligenceSummary description={aiSummary.description} tags={aiSummary.tags} />

      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyDetailStats />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-[63px]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <CompanyAbout
            isLoading={isLoading}
            companyName={company.name}
            description={company.description}
            tags={company.tags}
            yearsFounded={company.founded}
            headquarters={company.headquarters}
            employees={company.employees}
            status={company.status}
          />
          <RecentSignals isLoading={isLoading} RECENT_SIGNALS={RECENT_SIGNALS} />
          <RecentActivityCompany isLoading={isLoading} RECENT_ACTIVITY_DETAIL_COMPANY={RECENT_ACTIVITY_DETAIL_COMPANY} />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <OrganizationStructureCard />
          <CompanyKeyPeopleCard isLoading={isLoading} />
          <SimiliarCompaniesCard isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

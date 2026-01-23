"use client";

import { useState } from "react";
import { AiIntelligenceSummary, CompanyAbout, CompanyDetailStats, CompanyKeyPeopleCard, OrganizationStructureCard, RecentSignals, SimiliarCompaniesCard } from "@/components/omnichannel";
import RecentActivityCompany from "@/components/omnichannel/company/detail-company/RecentActivityDetailCompany";
import PageHeader from "@/components/ui/page-header";
import { RECENT_ACTIVITY_DETAIL_COMPANY } from "@/lib/data/recent-activity-detail-company";
import { RECENT_SIGNALS } from "@/lib/data/recent-signals";

export default function CompanyProfileClient() {
  const [isLoading, setIsloading] = useState<boolean>(false);

  // Solvera company data
  const solveraCompany = {
    name: "Solvera",
    description: "Solvera is a leading technology company specializing in innovative software solutions and digital transformation services. We help businesses streamline their operations and achieve their digital goals through cutting-edge technology and expert consulting.",
    tags: ["Technology", "Software Development", "Digital Transformation", "Consulting", "Innovation"],
    founded: "2015",
    headquarters: "Jakarta, Indonesia",
    employees: "150-200",
    status: "Active" as const
  };

  const solveraAiSummary = {
    description: "Solvera is a dynamic technology company focused on delivering comprehensive software solutions and digital transformation services. With a strong presence in the Indonesian market, the company has established itself as a trusted partner for businesses seeking to modernize their operations and embrace digital innovation.",
    tags: ["Tech Leader", "Digital Innovation", "Growth Stage", "B2B Focus"]
  };

  return (
    <div className="p-6 pt-6">
      <PageHeader 
        title="Solvera" 
        breadcrumbs={[
          { label: "Admin" }, 
          { label: "Company Profile" }
        ]} 
      />

      <AiIntelligenceSummary 
        description={solveraAiSummary.description} 
        tags={solveraAiSummary.tags} 
      />

      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyDetailStats />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-[63px]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <CompanyAbout
            isLoading={isLoading}
            companyName={solveraCompany.name}
            description={solveraCompany.description}
            tags={solveraCompany.tags}
            yearsFounded={solveraCompany.founded}
            headquarters={solveraCompany.headquarters}
            employees={solveraCompany.employees}
            status={solveraCompany.status}
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

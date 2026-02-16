import CompanyStatsCard from "@/components/ui/company-stats-card";
import { COMPANY_DETAIL_STATS } from "@/lib/data/company-detail-stats";
import type { CompanyStatsCardProps } from "@/components/ui/company-stats-card";

interface CompanyDetailStatsProps {
  stats?: CompanyStatsCardProps[];
}

export default function CompanyDetailStats({ stats }: CompanyDetailStatsProps) {
  const statsList = stats && stats.length > 0 ? stats : COMPANY_DETAIL_STATS;
  return (
    <>
      {statsList.map((item) => (
        <CompanyStatsCard key={item.title} {...item} />
      ))}
    </>
  );
}

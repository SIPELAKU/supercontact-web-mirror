import CompanyStatsCard from "@/components/ui/company-stats-card";
import { COMPANY_DETAIL_STATS } from "@/lib/data/company-detail-stats";
import type { CompanyStatsCardProps } from "@/components/ui/company-stats-card";
import CompanyDetailStatsSkeleton from "./CompanyDetailStatsSkeleton";

interface CompanyDetailStatsProps {
  stats?: CompanyStatsCardProps[];
  /**
   * Skeleton cards while the stats load. Pass it so the sample stats below
   * never show in the meantime.
   */
  isLoading?: boolean;
}

export default function CompanyDetailStats({ stats, isLoading }: CompanyDetailStatsProps) {
  if (isLoading) return <CompanyDetailStatsSkeleton />;
  // No stats = the sample set (a placeholder for previews such as Company 360).
  const statsList = stats && stats.length > 0 ? stats : COMPANY_DETAIL_STATS;
  return (
    <>
      {statsList.map((item) => (
        <CompanyStatsCard key={item.title} {...item} />
      ))}
    </>
  );
}

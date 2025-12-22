import CompanyStatsCard from "@/components/ui/company-stats-card";
import { COMPANY_DETAIL_STATS } from "@/lib/data/company-detail-stats";

export default function CompanyDetailStats() {
  return (
    <>
      {COMPANY_DETAIL_STATS.map((item) => (
        <CompanyStatsCard key={item.title} {...item} />
      ))}
    </>
  );
}

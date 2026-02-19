import CompanyStatsCard from "@/components/ui/company-stats-card";
import { MyTargetCompaniesSummary } from "@/lib/types/company-intelligence";

interface CompanyStatsProps {
  summary?: MyTargetCompaniesSummary;
}

export default function CompanyStats({ summary }: CompanyStatsProps) {
  const data = [
    {
      title: "Total Companies",
      value: summary?.total_companies.toLocaleString() || "0",
      subtitle: "All Companies"
    },
    {
      title: "New This Week",
      value: summary?.new_this_week.toLocaleString() || "0",
      subtitle: "Added this week"
    },
    {
      title: "Active Recent",
      value: summary?.active_recent.toLocaleString() || "0",
      subtitle: "Active in last 30 days",
    },
    {
      title: "Active Connections",
      value: summary ? `${summary.active_percentage}%` : "0%",
      subtitle: "Active connections"
    },
  ];

  return (
    <>
      {data.map((item, index) => (
        <CompanyStatsCard key={index} title={item.title} value={item.value} subtitle={item.subtitle} />
      ))}
    </>
  );
}

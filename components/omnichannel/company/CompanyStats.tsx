import CompanyStatsCard from "@/components/ui/company-stats-card";

const data = [
  { title: "Total Companies", value: "12,408", subtitle: "All Companies" },
  { title: "New This Week", value: "4,125", subtitle: "Added this week" },
  {
    title: "High insight score",
    value: "3,205",
    subtitle: "High score components",
  },
  { title: "Active connections", value: "89%", subtitle: "Active connections" },
];

export default function CompanyStats() {
  return (
    <>
      {data.map((item, index) => (
        <CompanyStatsCard key={index} title={item.title} value={item.value} subtitle={item.subtitle} />
      ))}
    </>
  );
}

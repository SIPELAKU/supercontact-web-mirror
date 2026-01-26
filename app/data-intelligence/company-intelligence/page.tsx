import CompanyIntelligenceClient from "@/components/omnichannel/CompanyIntelligenceClient";

export default function CompaniesPage() {
  return (
    <CompanyIntelligenceClient
      breadcrumbs={[{ label: "Data Intelligence" }, { label: "Company" }]}
    />
  );
}

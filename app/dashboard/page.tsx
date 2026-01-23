import PageHeader from "@/components/ui/page-header";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function MainDashboard() {
  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Sales Dashboard"
        breadcrumbs={[
          { label: "Dashboard" },
        ]}
      />
      <DashboardClient />
    </div>
  );
}
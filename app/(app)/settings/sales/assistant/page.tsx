"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import AccessDenied from "@/components/settings/AccessDenied";
import SalesAssistantTab from "@/components/admin/sales-settings/SalesAssistantTab";
import { usePermission } from "@/lib/hooks/usePermission";

export default function SettingsSalesAssistantPage() {
  const { can } = usePermission();
  if (!can("omnichannel:setup")) return <AccessDenied />;

  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Asisten Penjualan"
        description="Apakah bot boleh membaca sinyal minat beli dan mengikuti pedoman penjualan."
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Sales" },
          { label: "Asisten Penjualan" },
        ]}
      />
      <SalesAssistantTab />
    </div>
  );
}

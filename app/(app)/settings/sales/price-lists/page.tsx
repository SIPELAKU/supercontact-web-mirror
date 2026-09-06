"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import PriceListsTab from "@/components/admin/catalog-settings/PriceListsTab";

export default function SettingsPriceListsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Daftar Harga"
                description="Harga per pelanggan: tier, masa berlaku, dan daftar mana yang dipakai saat quotation dibuat."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    // There is no Sales index page; the crumb points at Settings
                    // like the Phase 1 catalogue screens do.
                    { label: "Sales", href: "/settings" },
                    { label: "Daftar Harga" },
                ]}
            />
            <PriceListsTab />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import UnitsTab from "@/components/admin/catalog-settings/UnitsTab";

export default function SettingsUnitsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Satuan"
                description="Satuan produk dan berapa desimal yang boleh dipakai jumlah di quotation."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Satuan" },
                ]}
            />
            <UnitsTab />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import SalesChannelsTab from "@/components/admin/catalog-settings/SalesChannelsTab";

export default function SettingsSalesChannelsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Kanal Penjualan"
                description="Dari mana penjualan datang - WhatsApp, Web Widget, Email, Langsung - dan akun omnichannel yang melayaninya."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Kanal Penjualan" },
                ]}
            />
            <SalesChannelsTab />
        </div>
    );
}

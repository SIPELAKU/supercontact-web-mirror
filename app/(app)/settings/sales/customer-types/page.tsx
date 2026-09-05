"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CustomerTypesTab from "@/components/admin/catalog-settings/CustomerTypesTab";

export default function SettingsCustomerTypesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Tipe Pelanggan"
                description="Kelompok pelanggan seperti Reseller atau Korporat - dipakai sebagai penetapan daftar harga dan sebagai syarat segmen."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    // There is no Sales index page; the crumb points at Settings
                    // like the Phase 1 and Phase 2 screens do.
                    { label: "Sales", href: "/settings" },
                    { label: "Tipe Pelanggan" },
                ]}
            />
            <CustomerTypesTab />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CustomerSegmentsTab from "@/components/admin/catalog-settings/CustomerSegmentsTab";

export default function SettingsCustomerSegmentsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Segmen Pelanggan"
                description="Aturan atas fakta pelanggan - tipe, wilayah, kanal, tag, status lead dan nilai quotation diterima - yang dihitung ulang setiap quotation dibuat."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Segmen Pelanggan" },
                ]}
            />
            <CustomerSegmentsTab />
        </div>
    );
}

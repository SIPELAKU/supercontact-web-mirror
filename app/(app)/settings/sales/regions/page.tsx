"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import RegionsTab from "@/components/admin/catalog-settings/RegionsTab";

export default function SettingsRegionsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Wilayah"
                description="Hierarki wilayah untuk harga dan segmen. Impor 38 provinsi Indonesia, lalu cocokkan dari data perusahaan yang tersimpan."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Wilayah" },
                ]}
            />
            <RegionsTab />
        </div>
    );
}

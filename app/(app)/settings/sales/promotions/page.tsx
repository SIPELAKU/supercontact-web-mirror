"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import PromotionsTab from "@/components/admin/catalog-settings/PromotionsTab";

// COMMERCIAL Phase 5 (spec I6). The thirteenth Settings > Sales entry, on the
// discount-policies page shape.
export default function SettingsPromotionsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Promosi"
                description="Potongan harga yang diberikan perusahaan sendiri - masuk ke harga satuan sebelum diskon penjual, dan di luar batas Kebijakan Diskon."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    // There is no Sales index page; the crumb points at Settings
                    // like the Phase 1, 2, 3 and 4 screens do.
                    { label: "Sales", href: "/settings" },
                    { label: "Promosi" },
                ]}
            />
            <PromotionsTab />
        </div>
    );
}

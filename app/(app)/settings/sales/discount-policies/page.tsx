"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import DiscountPoliciesTab from "@/components/admin/catalog-settings/DiscountPoliciesTab";

export default function SettingsDiscountPoliciesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Kebijakan Diskon"
                description="Batas diskon dan ambang persetujuan per peran atau per pengguna - yang paling spesifik menang."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    // There is no Sales index page; the crumb points at Settings
                    // like the Phase 1, 2 and 3 screens do.
                    { label: "Sales", href: "/settings" },
                    { label: "Kebijakan Diskon" },
                ]}
            />
            <DiscountPoliciesTab />
        </div>
    );
}

"use client";

import { Suspense } from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CustomFieldDefinitionsTab from "@/components/admin/catalog-settings/CustomFieldDefinitionsTab";

export default function SettingsSalesCustomFieldsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Custom Fields"
                description="Field tambahan untuk produk, kontak, perusahaan (CRM) dan quotation."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Custom Fields" },
                ]}
            />
            {/* useSearchParams (the ?entity= selector) needs a Suspense boundary. */}
            <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Memuat…</div>}>
                <CustomFieldDefinitionsTab />
            </Suspense>
        </div>
    );
}

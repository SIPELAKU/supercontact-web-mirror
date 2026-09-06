"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ProductCategoriesTab from "@/components/admin/catalog-settings/ProductCategoriesTab";

export default function SettingsProductCategoriesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Kategori Produk"
                description="Pohon kategori sampai tiga tingkat. Kategori diarsipkan, tidak pernah dihapus."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Kategori Produk" },
                ]}
            />
            <ProductCategoriesTab />
        </div>
    );
}

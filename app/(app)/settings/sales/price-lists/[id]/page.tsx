"use client";

import { useParams } from "next/navigation";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import PriceListDetail from "@/components/admin/catalog-settings/PriceListDetail";

// No `settingsNav` entry is needed: `findActiveSettingsEntry` resolves an
// unlisted route by longest-prefix match against its listed parent, so this
// page inherits the parent's `sales:config:manage` guard - the
// /settings/organization/[id] precedent.
export default function PriceListDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Detail Daftar Harga"
                description="Harga per produk beserta tier dan masa berlakunya, dan pelanggan yang memakainya."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    // Resolved back to wherever the list was left (SettingsBreadcrumb).
                    { label: "Daftar Harga", href: "/settings/sales/price-lists" },
                    { label: "Detail" },
                ]}
            />
            <PriceListDetail priceListId={id} />
        </div>
    );
}

"use client";

import { useParams } from "next/navigation";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CustomerSegmentDetail from "@/components/admin/catalog-settings/CustomerSegmentDetail";

// No `settingsNav` entry is needed: `findActiveSettingsEntry` resolves an
// unlisted route by longest-prefix match against its listed parent, so this
// page inherits the parent's `sales:config:manage` guard - the price-list
// detail precedent.
export default function CustomerSegmentDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Detail Segmen"
                description="Syarat yang harus dipenuhi kontak agar masuk segmen ini, dan bagaimana segmen dipakai saat harga dihitung."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    // Resolved back to wherever the list was left (SettingsBreadcrumb).
                    { label: "Segmen Pelanggan", href: "/settings/sales/customer-segments" },
                    { label: "Detail" },
                ]}
            />
            <CustomerSegmentDetail segmentId={id} />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ContactTagsTab from "@/components/admin/catalog-settings/ContactTagsTab";

export default function SettingsContactTagsPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Tag Kontak"
                description="Kosakata tag milik workspace. Satu tag dipakai bersama semua kontak, jadi mengubah namanya berlaku untuk semuanya sekaligus."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Tag Kontak" },
                ]}
            />
            <ContactTagsTab />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import PipelineStagesTab from "@/components/admin/pipeline-settings/PipelineStagesTab";

export default function SettingsPipelineStagesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Tahapan Penjualan"
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Tahapan Penjualan" },
                ]}
            />
            <PipelineStagesTab />
        </div>
    );
}

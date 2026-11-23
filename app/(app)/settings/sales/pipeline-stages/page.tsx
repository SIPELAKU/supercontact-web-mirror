"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import PipelineStagesSettings from "@/components/admin/pipeline-settings/PipelineStagesSettings";

export default function SettingsPipelineStagesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Tahapan Penjualan"
                description="The same stages as the Pipeline board. Drag to reorder: Prospect stays first, Closed - Won and Closed - Lost stay last. Changes are saved when you click Save."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Tahapan Penjualan" },
                ]}
            />
            <PipelineStagesSettings />
        </div>
    );
}

"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import QuotationTemplatesTab from "@/components/admin/quotation-templates/QuotationTemplatesTab";

export default function SettingsQuotationTemplatesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Template Quotation"
                description="Tampilan PDF quotation. Template default dipakai untuk setiap quotation baru; quotation yang sudah dikirim tetap memakai template saat dikirim."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Template Quotation" },
                ]}
            />
            <QuotationTemplatesTab />
        </div>
    );
}

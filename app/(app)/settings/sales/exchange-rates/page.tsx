"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ExchangeRatesTab from "@/components/admin/catalog-settings/ExchangeRatesTab";

// COMMERCIAL Phase 5 (spec I7). The fourteenth Settings > Sales entry.
export default function SettingsExchangeRatesPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Kurs Mata Uang"
                description="Kurs yang dipakai saat quotation diterbitkan dalam mata uang selain mata uang perusahaan. Harga, daftar harga dan kebijakan diskon tetap dalam mata uang perusahaan."
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Sales", href: "/settings" },
                    { label: "Kurs Mata Uang" },
                ]}
            />
            <ExchangeRatesTab />
        </div>
    );
}

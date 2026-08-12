import { Metadata } from "next";
import { PriceClient } from "@/components/price/PriceClient";

const PAGE_URL = "https://www.smartsales.id/price";

export const metadata: Metadata = {
    title: "Paket Harga CRM, Sales & Omnichannel",
    description:
        "Lihat paket harga SmartSales untuk CRM Sales, CRM Services, dan Omnichannel WhatsApp & Email. Coba gratis, tanpa komitmen di awal.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Paket Harga | SmartSales",
        description:
            "Lihat paket harga SmartSales untuk CRM Sales, CRM Services, dan Omnichannel WhatsApp & Email. Coba gratis, tanpa komitmen di awal.",
        url: PAGE_URL,
        siteName: "SmartSales",
        locale: "id_ID",
        type: "website",
    },
};

export default function PricePage() {
    return <PriceClient />;
}

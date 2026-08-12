import { Metadata } from "next";
import { PriceClient } from "@/components/price/PriceClient";
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://www.smartsales.id/price";

const OG_IMAGE = ogImageUrl({ title: 'Paket Harga CRM, Sales & Omnichannel', category: 'Harga' });

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
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        images: [OG_IMAGE],
    },
};

export default function PricePage() {
    return <PriceClient />;
}

import { Metadata } from "next";
import { CompanyClient } from "@/components/company/CompanyClient";
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://www.smartsales.id/company";

const OG_IMAGE = ogImageUrl({ title: 'Tentang Kami', category: 'Tentang Kami' });

export const metadata: Metadata = {
    title: "Tentang Kami",
    description:
        "SmartSales adalah platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia. Kenali tim dan misi kami.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Tentang Kami | SmartSales",
        description:
            "SmartSales adalah platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia.",
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

export default function CompanyPage() {
    return (
        <CompanyClient />
    );
}

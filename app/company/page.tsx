import { Metadata } from "next";
import { CompanyClient } from "@/components/company/CompanyClient";

const PAGE_URL = "https://www.smartsales.id/company";

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
    },
};

export default function CompanyPage() {
    return (
        <CompanyClient />
    );
}

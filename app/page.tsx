// app/page.tsx (Home)
import { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";

const PAGE_URL = "https://www.smartsales.id/";

export const metadata: Metadata = {
  title: "CRM, Chat & Call Center untuk Sales, Marketing, dan Customer Support",
  description:
    "SmartSales mengintegrasikan CRM Sales, Omnichannel WhatsApp & Email, dan Customer Support dalam satu platform. Multi-tenant, custom build, untuk semua industri di Indonesia.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "SmartSales - CRM, Chat & Call Center untuk Sales, Marketing, dan Customer Support",
    description:
      "SmartSales mengintegrasikan CRM Sales, Omnichannel WhatsApp & Email, dan Customer Support dalam satu platform. Multi-tenant, custom build, untuk semua industri di Indonesia.",
    url: PAGE_URL,
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSales - CRM, Chat & Call Center untuk Sales, Marketing, dan Customer Support",
    description:
      "SmartSales mengintegrasikan CRM Sales, Omnichannel WhatsApp & Email, dan Customer Support dalam satu platform.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SmartSales",
  url: "https://www.smartsales.id",
  logo: "https://www.smartsales.id/assets/sc-logo.png",
  description:
    "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia.",
  areaServed: "ID",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SmartSales",
  url: "https://www.smartsales.id",
  inLanguage: "id-ID",
};

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema],
};

export default function Home() {
  return (
    <>
      <script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      <HomeClient />
    </>
  );
}

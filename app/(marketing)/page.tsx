// app/page.tsx (Home)
import { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id";

const OG_IMAGE = ogImageUrl({
  title: "CRM, Chat & Call Center untuk Sales, Marketing, dan Customer Support",
});

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSales - CRM, Chat & Call Center untuk Sales, Marketing, dan Customer Support",
    description:
      "SmartSales mengintegrasikan CRM Sales, Omnichannel WhatsApp & Email, dan Customer Support dalam satu platform.",
    images: [OG_IMAGE],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SmartSales",
  url: "https://smartsales.id",
  logo: "https://smartsales.id/assets/sc-icon-512.png",
  description:
    "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia.",
  areaServed: "ID",
  sameAs: [
    "https://www.instagram.com/smartsales.id/",
    "https://www.linkedin.com/company/smartsales-indonesia/",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SmartSales",
  url: "https://smartsales.id",
  inLanguage: "id-ID",
};

// Mirrors the FAQ section rendered on the homepage (components/layout/FAQ.tsx,
// Indonesian strings faq_q1..q4) so the markup stays truthful.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Apa itu Omnichannel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Omnichannel adalah integrasi antara saluran komunikasi yang berbeda untuk memberikan pengalaman yang konsisten kepada pelanggan.",
      },
    },
    {
      "@type": "Question",
      name: "Bagaimana cara aplikasi SmartSales bekerja?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SmartSales mengintegrasikan berbagai saluran komunikasi ke dalam satu platform untuk pengelolaan yang efisien.",
      },
    },
    {
      "@type": "Question",
      name: "Siapa saja yang bisa menggunakan aplikasi SmartSales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bisnis dari semua ukuran, dari startup hingga perusahaan besar, dapat menggunakan SmartSales.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah SmartSales terjamin keamanannya?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ya, kami memprioritaskan keamanan data dan mematuhi standar industri.",
      },
    },
  ],
};

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema, faqSchema],
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

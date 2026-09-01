import { Metadata } from "next";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id/register";

const OG_IMAGE = ogImageUrl({
  title: "Daftar Gratis - Coba CRM & Omnichannel",
});

// /register is a conversion target: indexable on purpose (also listed in
// sitemap.ts and allowed in robots.ts).
export const metadata: Metadata = {
  title: "Daftar Gratis - Coba CRM & Omnichannel",
  description:
    "Buat akun SmartSales gratis dan kelola pipeline sales, chat WhatsApp & Email, serta tiket pelanggan dalam satu platform. Daftar dan coba gratis sekarang.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Daftar Gratis SmartSales - Coba CRM & Omnichannel",
    description:
      "Buat akun SmartSales gratis dan kelola pipeline sales, chat WhatsApp & Email, serta tiket pelanggan dalam satu platform. Daftar dan coba gratis sekarang.",
    url: PAGE_URL,
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daftar Gratis SmartSales - Coba CRM & Omnichannel",
    description:
      "Buat akun SmartSales gratis dan kelola pipeline sales, chat WhatsApp & Email, serta tiket pelanggan dalam satu platform.",
    images: [OG_IMAGE],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

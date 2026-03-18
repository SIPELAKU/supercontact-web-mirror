import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { ConfirmationProvider } from "@/components/ui/confirm-modal";
import { AuthProvider } from "@/lib/context/AuthContext";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import type React from "react";
import { Toaster } from "react-hot-toast";
import { MuiLocalizationProvider } from "@/components/providers/MuiLocalizationProvider";
import "./globals.css";
import { Metadata } from "next";
import { Poppins } from "next/font/google";
import { LanguageProvider } from "@/lib/context/LanguageContext";

// SEO Metadata
export const metadata: Metadata = {
  title: {
    template: "%s | SmartSales",
    default: "SmartSales - Sales Management Platform",
  },
  description:
    "Platform manajemen penjualan dan CRM komprehensif untuk meningkatkan produktivitas tim sales Anda.",
  keywords: [
    "CRM",
    "Sales Management",
    "Lead Management",
    "Email Marketing",
    "Omnichannel",
  ],
  authors: [{ name: "SmartSales Team" }],
  openGraph: {
    title: "SmartSales - Sales Management Platform",
    description:
      "Platform manajemen penjualan dan CRM komprehensif untuk meningkatkan produktivitas tim sales Anda.",
    url: "https://smartsales.id",
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical SVG icons */}
        <link
          rel="preload"
          href="/assets/sales-icon-sb.svg"
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href="/assets/omnichannel.svg"
          as="image"
          type="image/svg+xml"
        />
        <link rel="preload" href="/assets/sc-logo.png" as="image" />
      </head>
      <body
        className={`${poppins.className} antialiased min-h-screen bg-[#ffffff]`}
      >
        <Toaster 
          position="top-right" 
          containerStyle={{
            zIndex: 100000,
          }}
        />
        <MuiLocalizationProvider>
          <ConfirmationProvider>
            <AuthProvider>
              <ReactQueryProvider>
                <LanguageProvider>
                  <AuthenticatedLayout>{children}</AuthenticatedLayout>
                </LanguageProvider>
              </ReactQueryProvider>
            </AuthProvider>
          </ConfirmationProvider>
        </MuiLocalizationProvider>
      </body>
    </html>
  );
}

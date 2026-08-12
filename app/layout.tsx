import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { ConfirmationProvider } from "@/components/ui/confirm-modal";
import { AuthProvider } from "@/lib/context/AuthContext";
import { NotificationsProvider } from "@/lib/context/NotificationsContext";
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
  metadataBase: new URL("https://www.smartsales.id"),
  title: {
    template: "%s | SmartSales",
    default: "SmartSales - Platform CRM, Sales, Marketing & Customer Support Terintegrasi",
  },
  description:
    "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia. Multi-tenant, custom build, satu sistem untuk seluruh tim Anda.",
  keywords: [
    "CRM",
    "Sales Management",
    "Lead Management",
    "Email Marketing",
    "Omnichannel",
    "WhatsApp Business API",
    "CRM Indonesia",
    "software CRM",
  ],
  authors: [{ name: "SmartSales Team" }],
  openGraph: {
    title: "SmartSales - Platform CRM, Sales, Marketing & Customer Support Terintegrasi",
    description:
      "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia. Multi-tenant, custom build, satu sistem untuk seluruh tim Anda.",
    url: "https://www.smartsales.id",
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSales - Platform CRM, Sales, Marketing & Customer Support Terintegrasi",
    description:
      "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia.",
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
              <NotificationsProvider>
                <ReactQueryProvider>
                  <LanguageProvider>
                    <AuthenticatedLayout>{children}</AuthenticatedLayout>
                  </LanguageProvider>
                </ReactQueryProvider>
              </NotificationsProvider>
            </AuthProvider>
          </ConfirmationProvider>
        </MuiLocalizationProvider>
      </body>
    </html>
  );
}

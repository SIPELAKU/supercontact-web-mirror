import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { ConfirmationProvider } from "@/components/ui/confirm-modal";
import { AuthProvider } from "@/lib/context/AuthContext";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import type React from "react";
import { Toaster } from "react-hot-toast";
import { MuiLocalizationProvider } from "@/components/providers/MuiLocalizationProvider";
import "./globals.css";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: {
    template: "%s | SuperContact",
    default: "SuperContact - Sales Management Platform",
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
  authors: [{ name: "SuperContact Team" }],
  openGraph: {
    title: "SuperContact - Sales Management Platform",
    description:
      "Platform manajemen penjualan dan CRM komprehensif untuk meningkatkan produktivitas tim sales Anda.",
    url: "https://supercontact.com",
    siteName: "SuperContact",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   variable: "--font-poppins",
// })

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
      <body className="font-sans antialiased min-h-screen bg-[#ffffff]">
        <Toaster position="top-right" />
        <MuiLocalizationProvider>
          <ConfirmationProvider>
            <AuthProvider>
              <ReactQueryProvider>
                <AuthenticatedLayout>{children}</AuthenticatedLayout>
              </ReactQueryProvider>
            </AuthProvider>
          </ConfirmationProvider>
        </MuiLocalizationProvider>
      </body>
    </html>
  );
}

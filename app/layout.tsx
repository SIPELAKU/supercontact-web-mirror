import { AuthProvider } from "@/lib/context/AuthContext";
import type React from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Metadata } from "next";
import { Poppins } from "next/font/google";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { AppThemeProvider } from "@/components/providers/AppThemeProvider";
import { ThemeModeProvider } from "@/lib/context/ThemeModeContext";
import { isFeatureHidden } from "@/lib/config/featureFlags";
import { themeBootScript } from "@/lib/utils/theme";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { ogImageUrl } from "@/lib/utils/og-image";

const DEFAULT_OG_IMAGE = ogImageUrl({ title: "Platform CRM, Sales, Marketing & Customer Support Terintegrasi" });

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://smartsales.id"),
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
    url: "https://smartsales.id",
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSales - Platform CRM, Sales, Marketing & Customer Support Terintegrasi",
    description:
      "Platform CRM, sales, marketing, dan customer support terintegrasi untuk bisnis di Indonesia.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "UMr64HslfYMY_DURvFqKqNWgUfzd9xiLySIyWmpk4yg",
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
    // suppressHydrationWarning: the theme script below may add "dark" to
    // <html> before React hydrates.
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Dark mode applied before the first paint, so a dark page does not
            flash white. Left out while the switch is hidden. */}
        {!isFeatureHidden("themeSwitch") && <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />}
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
        <link rel="preload" href="/assets/sc-logo-primary.svg" as="image" type="image/svg+xml" />
      </head>
      <body
        className={`${poppins.className} antialiased min-h-screen bg-white`}
      >
        <GoogleAnalytics />
        <Toaster
          position="top-right"
          containerStyle={{
            zIndex: 100000,
          }}
        />
        <ThemeModeProvider>
          <AppThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LanguageProvider>
          </AppThemeProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}

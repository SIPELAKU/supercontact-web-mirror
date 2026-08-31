import { Metadata } from "next";

// Login has no search value — keep it out of the index.
export const metadata: Metadata = {
  title: "Masuk ke Akun",
  description:
    "Masuk ke akun SmartSales Anda untuk mengelola CRM Sales, Omnichannel WhatsApp & Email, dan tiket pelanggan.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://smartsales.id/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

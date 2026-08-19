import { Metadata } from "next";

// Post-registration OTP step — noindex.
export const metadata: Metadata = {
  title: "Verifikasi Email Akun",
  description:
    "Verifikasi alamat email Anda untuk menyelesaikan pendaftaran akun SmartSales.",
  robots: { index: false, follow: false },
};

export default function EmailVerificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}

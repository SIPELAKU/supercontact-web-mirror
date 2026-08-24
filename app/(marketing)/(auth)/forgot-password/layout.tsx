import { Metadata } from "next";

// Applies to /forgot-password and /forgot-password/verify-otp.
// Utility flow pages — noindex.
export const metadata: Metadata = {
  title: "Reset Password Akun",
  description:
    "Atur ulang password akun SmartSales Anda melalui email terdaftar.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

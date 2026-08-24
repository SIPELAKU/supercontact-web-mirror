import { Metadata } from "next";

// Password-reset completion step — noindex.
export const metadata: Metadata = {
  title: "Buat Password Baru",
  description:
    "Buat password baru untuk akun SmartSales Anda dan lanjutkan mengelola bisnis Anda.",
  robots: { index: false, follow: false },
};

export default function NewPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

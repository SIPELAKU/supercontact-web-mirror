import { Metadata } from "next";
import PublicMagnetClient from "@/components/smart-capture/public/PublicMagnetClient";

// Per-lead magnet links are campaign landing pages, not search content — noindex
// (robots.ts also disallows /m/).
export const metadata: Metadata = {
  title: "Lead Magnet",
  robots: { index: false, follow: false },
};

export default function MagnetPage() {
  return <PublicMagnetClient />;
}

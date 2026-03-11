import HotelClient from "@/components/solution-hotel/HotelClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Solusi Industri Perhotelan | SmartSales',
  description: 'Tingkatkan okupansi kamar dan kepuasan tamu hotel Anda dengan sistem reservasi dan layanan terotomatisasi dari SmartSales.',
}

export default function HotelSolutionPage() {
  return <HotelClient />;
}

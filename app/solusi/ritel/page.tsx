import { Metadata } from 'next';
import RetailClient from '@/components/solution-retail/RetailClient';

export const metadata: Metadata = {
  title: 'Solusi Industri Ritel & Toko - SmartSales',
  description: 'Ubah pelanggan singgah menjadi pembeli setia dengan SmartSales. Kelola database member, broadcast promo via WhatsApp, dan tangani klaim garansi dengan lebih efisien.',
};

export default function RetailPage() {
  return <RetailClient />;
}

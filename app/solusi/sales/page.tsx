import { Metadata } from 'next';
import SalesClient from '@/components/solusi/sales/SalesClient';

export const metadata: Metadata = {
  title: 'Solusi Tim Sales - SmartSales',
  description: 'Berhenti menebak-nebak status prospek Anda. SmartSales memberikan visibilitas penuh atas pipeline penjualan dan mengotomatiskan follow-up.',
};

export default function SalesPage() {
  return <SalesClient />;
}

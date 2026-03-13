import { Metadata } from 'next';
import FmcgClient from '@/components/solution-fmcg/FmcgClient';

export const metadata: Metadata = {
  title: 'Solusi Industri FMCG - SmartSales',
  description: 'Optimalkan distribusi FMCG Anda dengan SmartSales. Kelola pesanan via WhatsApp, kunjungan sales lapangan (canvassing), dan retur produk dengan lebih efisien.',
};

export default function FmcgPage() {
  return <FmcgClient />;
}

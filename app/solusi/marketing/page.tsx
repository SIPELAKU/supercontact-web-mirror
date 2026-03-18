import { Metadata } from 'next';
import MarketingClient from '@/components/solusi/marketing/MarketingClient';

export const metadata: Metadata = {
  title: 'Solusi Tim Marketing - SmartSales',
  description: 'Ubah setiap kampanye menjadi mesin penghasil leads. Kirimkan promosi tertarget via WhatsApp dan Email, kelola balasan pelanggan, dan buktikan ROI pemasaran Anda.',
};

export default function MarketingPage() {
  return <MarketingClient />;
}

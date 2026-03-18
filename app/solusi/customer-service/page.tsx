import { Metadata } from 'next';
import CSClient from '@/components/solusi/customer-service/CSClient';

export const metadata: Metadata = {
  title: 'Solusi Tim Customer Service - SmartSales',
  description: 'Berikan layanan pelanggan yang cepat, personal, dan efisien. SmartSales menyatukan semua saluran komunikasi dan sistem ticketing dalam satu layar.',
};

export default function CustomerServicePage() {
  return <CSClient />;
}

import { Metadata } from 'next';
import OutsourcingClient from '@/components/solution-outsourcing/OutsourcingClient';

export const metadata: Metadata = {
  title: 'Solusi Industri Outsourcing - SmartSales',
  description: 'Kelola ribuan kandidat & klien B2B dalam satu platform dengan SmartSales. Tinggalkan spreadsheet, otomatiskan rekrutmen, dan tingkatkan profesionalisme layanan Anda.',
};

export default function OutsourcingPage() {
  return <OutsourcingClient />;
}

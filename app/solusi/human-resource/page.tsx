import { Metadata } from 'next';
import HRClient from '@/components/solusi/human-resource/HRClient';

export const metadata: Metadata = {
  title: 'Solusi Tim Human Resource - SmartSales',
  description: 'Kelola feedback karyawan secara profesional. Satukan setiap pertanyaan internal dan proses rekrutmen dalam satu sistem terpusat.',
};

export default function HRPage() {
  return <HRClient />;
}

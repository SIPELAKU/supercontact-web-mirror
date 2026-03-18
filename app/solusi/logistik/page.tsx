import { Metadata } from 'next';
import LogisticsClient from '@/components/solution-logistics/LogisticsClient';

export const metadata: Metadata = {
    title: 'Solusi Industri Logistik | SmartSales',
    description: 'Optimalkan pengiriman, jadwal pickup, dan layanan pelanggan B2B Anda dengan solusi digital terintegrasi dari SmartSales.',
};

export default function LogisticsPage() {
    return <LogisticsClient />;
}

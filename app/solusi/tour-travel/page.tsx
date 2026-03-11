import TravelClient from '../../../components/solution-travel/TravelClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Solusi Tour & Travel | SmartSales CRM',
    description: 'Tingkatkan pemesanan paket liburan dan kelola reschedule tiket dengan mudah menggunakan solusi CRM khusus industri tour & travel dari SmartSales.',
};

export default function TravelSolutionPage() {
    return <TravelClient />;
}

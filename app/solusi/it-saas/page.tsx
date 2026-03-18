import { Metadata } from 'next';
import ITSaaSClient from '@/components/solution-it-saas/ITSaaSClient';

export const metadata: Metadata = {
  title: 'Solusi Industri IT & SaaS - SmartSales',
  description: 'Tutup deal B2B lebih cepat & otomatiskan IT support dengan SmartSales. Kelola pipeline proyek, helpdesk WhatsApp, dan penugasan bug secara profesional.',
};

export default function ITSaaSPage() {
  return <ITSaaSClient />;
}

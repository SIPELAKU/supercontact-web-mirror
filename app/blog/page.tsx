import { Metadata } from 'next';
import BlogIndexClient from '@/components/blog/BlogIndexClient';

const PAGE_URL = 'https://www.smartsales.id/blog';

export const metadata: Metadata = {
    title: 'Blog: Panduan Sales, Marketing & CRM',
    description: 'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM dari tim SmartSales.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Blog SmartSales | Panduan Sales, Marketing & CRM',
        description: 'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM dari tim SmartSales.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog SmartSales | Panduan Sales, Marketing & CRM',
        description: 'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM dari tim SmartSales.',
    },
};

export default function BlogPage() {
    return <BlogIndexClient />;
}

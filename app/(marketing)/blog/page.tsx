import { Metadata } from 'next';
import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/blog';
const OG_IMAGE = ogImageUrl({ title: 'Panduan Sales, Marketing & CRM', category: 'Blog' });

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
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog SmartSales | Panduan Sales, Marketing & CRM',
        description: 'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM dari tim SmartSales.',
        images: [OG_IMAGE],
    },
};

export default function BlogPage() {
    return <BlogIndexClient />;
}

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

const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog SmartSales',
    url: PAGE_URL,
    description:
        'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM dari tim SmartSales.',
    inLanguage: 'id-ID',
    publisher: {
        '@type': 'Organization',
        name: 'SmartSales',
        url: 'https://www.smartsales.id',
        logo: 'https://www.smartsales.id/assets/sc-icon-512.png',
    },
};

const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: 'https://www.smartsales.id/',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: PAGE_URL,
        },
    ],
};

export default function BlogPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <BlogIndexClient />
        </>
    );
}

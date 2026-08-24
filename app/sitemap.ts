import type { MetadataRoute } from 'next';
import { blogArticles } from '@/content/blog/registry';

const BASE_URL = 'https://www.smartsales.id';

const solusiRoutes = [
    'customer-service',
    'fmcg',
    'human-resource',
    'it-saas',
    'keuangan',
    'logistik',
    'marketing',
    'operasional',
    'outsourcing',
    'perhotelan',
    'ritel',
    'sales',
    'tour-travel',
    'integrasi-sales-marketing',
];

const produkRoutes = ['crm-sales', 'crm-services', 'omnichannel', 'ticket'];

// Build-time timestamp: content only changes on deploy, so this is accurate
// enough and costs nothing.
const LAST_MODIFIED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
        { url: `${BASE_URL}/company`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/price`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/blog`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.7 },
        // Conversion target — indexable on purpose (see robots.ts).
        { url: `${BASE_URL}/register`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    ];

    const blog: MetadataRoute.Sitemap = blogArticles
        .filter((a) => !a.slug.startsWith('_'))
        .map((article) => ({
            url: `${BASE_URL}/blog/${article.slug}`,
            lastModified: LAST_MODIFIED,
            changeFrequency: 'monthly',
            priority: 0.65,
        }));

    const produk: MetadataRoute.Sitemap = produkRoutes.map((slug) => ({
        url: `${BASE_URL}/produk/${slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    const solusi: MetadataRoute.Sitemap = solusiRoutes.map((slug) => ({
        url: `${BASE_URL}/solusi/${slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: slug === 'integrasi-sales-marketing' ? 0.85 : 0.8,
    }));

    return [...staticRoutes, ...produk, ...solusi, ...blog];
}

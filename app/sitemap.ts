import type { MetadataRoute } from 'next';

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

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
        { url: `${BASE_URL}/company`, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/price`, changeFrequency: 'weekly', priority: 0.9 },
    ];

    const produk: MetadataRoute.Sitemap = produkRoutes.map((slug) => ({
        url: `${BASE_URL}/produk/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    const solusi: MetadataRoute.Sitemap = solusiRoutes.map((slug) => ({
        url: `${BASE_URL}/solusi/${slug}`,
        changeFrequency: 'monthly',
        priority: slug === 'integrasi-sales-marketing' ? 0.85 : 0.8,
    }));

    return [...staticRoutes, ...produk, ...solusi];
}

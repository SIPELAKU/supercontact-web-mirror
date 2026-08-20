import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.smartsales.id';

// /register is deliberately allowed and indexable: it is the site's main
// conversion target and is listed in the sitemap with its own metadata.
// /help is the public Help Center portal (app/(help)/) - unlike /m/ (per-lead
// campaign pages, disallowed below) it is meant to be indexable/SEO content.
const ALLOW = ['/', '/company', '/price', '/produk/', '/solusi/', '/blog', '/register', '/help', '/api/og'];

const DISALLOW = [
    '/dashboard',
    '/analytics/',
    '/data-intelligence/',
    '/email-marketing/',
    '/whatsapp-marketing/',
    '/lead-management',
    '/omnichannel',
    '/inbox',
    '/notes',
    '/notifications',
    '/profile',
    '/profile-user-setting',
    '/sales/',
    '/settings',
    '/settings/',
    '/smart-capture',
    '/smart-capture/',
    '/support/',
    '/contact',
    '/login',
    '/forgot-password',
    '/new-password',
    '/email-verification',
    '/m/',
    '/test/',
    '/demo/',
    '/api/',
];

// AI crawlers get the exact same allow/disallow as everyone else — the
// wildcard rule already covers them, but explicit entries make the policy
// auditable and stop a future wildcard-only edit from silently changing
// AI-crawler access too. No proprietary content here, so no reason to
// treat retrieval or training bots differently from search engines.
const AI_USER_AGENTS = [
    // Retrieval / answer-engine bots (fetch on-demand to answer a query)
    'OAI-SearchBot',
    'PerplexityBot',
    'Claude-SearchBot',
    'Claude-User',
    // Training/indexing bots
    'GPTBot',
    'Google-Extended',
    'CCBot',
    'anthropic-ai',
    'ClaudeBot',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ALLOW,
                disallow: DISALLOW,
            },
            ...AI_USER_AGENTS.map((userAgent) => ({
                userAgent,
                allow: ALLOW,
                disallow: DISALLOW,
            })),
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}

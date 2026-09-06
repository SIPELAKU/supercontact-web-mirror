import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

const BASE_URL = 'https://smartsales.id';

// Hosts allowed to serve the real (crawlable) robots policy. Everything else
// — dev/staging subdomains, *.vercel.app aliases — gets a blanket Disallow
// so non-prod deployments never enter the index. The middleware additionally
// stamps X-Robots-Tag: noindex on every non-prod response as belt-and-braces.
// (Reading headers() makes this route dynamic; robots.txt is tiny, so the
// per-request cost is irrelevant.)
const INDEXABLE_HOSTS = ['smartsales.id', 'www.smartsales.id'];

// /register is deliberately allowed and indexable: it is the site's main
// conversion target and is listed in the sitemap with its own metadata.
// /help stays ALLOWED but its pages carry noindex meta (crawl-allowed so the
// noindex is actually read — never combine Disallow with noindex): the Help
// Center is force-dynamic client-fetch, so crawlers get contentless spinner
// HTML. Flip the per-page robots back to index:true when it gets real SSR.
const ALLOW = [
    '/',
    '/company',
    '/price',
    '/produk/',
    '/solusi/',
    '/blog',
    '/register',
    '/help',
    '/api/og',
    '/privacy-policy',
    '/terms-conditions',
];

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
    // Public quotation acceptance links (Phase 4). Every /q/<code> URL is a
    // private commercial document addressed to one customer, and the code IS
    // the credential - it must never enter an index. The page also carries
    // robots noindex/nofollow of its own.
    '/q/',
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
    const host = (headers().get('host') ?? '').split(':')[0];
    if (!INDEXABLE_HOSTS.includes(host)) {
        return {
            rules: [{ userAgent: '*', disallow: '/' }],
        };
    }

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

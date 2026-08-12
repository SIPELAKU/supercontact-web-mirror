import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.smartsales.id';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/company', '/price', '/produk/', '/solusi/', '/blog'],
            disallow: [
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
                '/contact/detail/',
                '/login',
                '/register',
                '/forgot-password',
                '/new-password',
                '/email-verification',
                '/m/',
                '/test/',
                '/api/',
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}

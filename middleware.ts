import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES_PREFIX = [
    '/analytics',
    '/contact',
    '/dashboard',
    '/data-intelligence',
    '/demo',
    '/email-marketing',
    '/inbox',
    '/lead-management',
    '/notes',
    '/notifications',
    '/omnichannel',
    '/profile',
    '/sales',
    '/settings',
    '/smart-capture',
    '/support',
    '/test',
    '/whatsapp-marketing',
];

const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/new-password',
];

// Only the production hosts may be indexed. dev.smartsales.id,
// staging.smartsales.id and *.vercel.app serve the same app with the same
// robots.txt route, so without this header every non-prod deployment is
// crawlable duplicate content. Canonical host is the APEX (www 308s to it).
const INDEXABLE_HOSTS = ['smartsales.id', 'www.smartsales.id'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    const host = (request.headers.get('host') ?? '').split(':')[0];
    const noindex = !INDEXABLE_HOSTS.includes(host);
    const withRobotsHeader = (response: NextResponse) => {
        if (noindex) {
            response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        }
        return response;
    };

    // Function to check if the path starts with any of the protected prefixes
    const isProtectedRoute = PROTECTED_ROUTES_PREFIX.some(prefix => pathname.startsWith(prefix));

    // Function to check if the path is an auth route
    const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

    // Case 1: User is authenticated
    if (token) {
        // If accessing root '/' or auth routes, redirect to dashboard
        if (pathname === '/' || isAuthRoute) {
            return withRobotsHeader(NextResponse.redirect(new URL('/dashboard', request.url)));
        }
    }
    // Case 2: User is NOT authenticated
    else {
        // If accessing a protected route, redirect to login
        if (isProtectedRoute) {
            const url = new URL('/login', request.url);
            // Optional: Preserve the redirect URL
            // url.searchParams.set('callbackUrl', encodeURI(request.url));
            return withRobotsHeader(NextResponse.redirect(url));
        }
        // Allow access to public routes (landing page '/', auth routes, etc.)
    }

    return withRobotsHeader(NextResponse.next());
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};

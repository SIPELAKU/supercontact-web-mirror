import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES_PREFIX = [
    '/analytics',
    '/dashboard',
    '/data-intelligence',
    '/email-marketing',
    '/inbox',
    '/lead-management',
    '/omnichannel',
    '/organization',
    '/profile',
    '/sales',
    '/support',
    '/users',
    '/roles'
];

const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Function to check if the path starts with any of the protected prefixes
    const isProtectedRoute = PROTECTED_ROUTES_PREFIX.some(prefix => pathname.startsWith(prefix));

    // Function to check if the path is an auth route
    const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

    // Case 1: User is authenticated
    if (token) {
        // If accessing root '/' or auth routes, redirect to dashboard
        if (pathname === '/' || isAuthRoute) {
            return NextResponse.redirect(new URL('/analytics/dashboard', request.url));
        }
    }
    // Case 2: User is NOT authenticated
    else {
        // If accessing a protected route, redirect to login
        if (isProtectedRoute) {
            const url = new URL('/login', request.url);
            // Optional: Preserve the redirect URL 
            // url.searchParams.set('callbackUrl', encodeURI(request.url)); 
            return NextResponse.redirect(url);
        }
        // Allow access to public routes (landing page '/', auth routes, etc.)
    }

    return NextResponse.next();
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

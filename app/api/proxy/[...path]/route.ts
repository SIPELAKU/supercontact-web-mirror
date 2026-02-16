// app/api/proxy/[...path]/route.ts
// This acts as a proxy to forward requests to the backend API
// Similar to nginx proxy in production

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;
const AUTH_COOKIE_NAME = 'access_token';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const url = `${BACKEND_URL}/${path}${queryString}`;

    console.log(`[Proxy] ${method} ${url}`);

    // Get headers from original request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Forward important headers
      if (
        key.toLowerCase() === 'authorization' ||
        key.toLowerCase() === 'content-type' ||
        key.toLowerCase() === 'accept'
      ) {
        headers[key] = value;
      }
    });

    // Fallback: if Authorization header is not sent by client,
    // use access_token cookie so authenticated proxy calls still work.
    const hasAuthorizationHeader = Object.keys(headers).some(
      (key) => key.toLowerCase() === 'authorization'
    );
    if (!hasAuthorizationHeader) {
      const tokenFromCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (tokenFromCookie) {
        headers.Authorization = `Bearer ${tokenFromCookie}`;
      }
    }

    // Get body for POST/PUT/PATCH/DELETE requests
    let body = undefined;
    if (method !== 'GET') {
      try {
        body = await request.text();
      } catch (e) {
        console.error('[Proxy] Failed to read request body:', e);
      }
    }

    // Make request to backend.
    // Handle redirects manually so Authorization can be preserved on redirected URLs.
    let response = await fetch(url, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    let redirectCount = 0;
    while (
      [301, 302, 307, 308].includes(response.status) &&
      redirectCount < 3
    ) {
      const location = response.headers.get('location');
      if (!location) break;

      const redirectedUrl = new URL(location, url).toString();
      console.log(`[Proxy] Redirect ${response.status} -> ${redirectedUrl}`);

      response = await fetch(redirectedUrl, {
        method,
        headers,
        body,
        redirect: 'manual',
      });
      redirectCount += 1;
    }

    // Get response data
    const data = await response.text();

    // Create response with same status
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Proxy request failed' }
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to your external API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`;
    console.log('Proxying password reset request to:', apiUrl);
    console.log('With authorization header:', authHeader ? 'Bearer [TOKEN]' : 'None');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward the authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Password reset response:', { status: response.status, data });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Password reset proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
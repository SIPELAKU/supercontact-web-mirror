import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json();
    
    // Validate log entry
    if (!logEntry.level || !logEntry.message) {
      return NextResponse.json(
        { error: 'Invalid log entry' },
        { status: 400 }
      );
    }

    // Log to server console (will appear in Vercel function logs)
    const serverLogEntry = {
      ...logEntry,
      source: 'client',
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    };

    // Use appropriate console method based on level
    const consoleMethod = console[logEntry.level] || console.log;
    consoleMethod('[CLIENT LOG]', JSON.stringify(serverLogEntry, null, 2));


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LOG API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process log entry' },
      { status: 500 }
    );
  }
}

// Optional: retrieve recent logs (for debugging)
export async function GET() {
  return NextResponse.json({
    message: 'Logs API is working',
    timestamp: new Date().toISOString(),
  });
}
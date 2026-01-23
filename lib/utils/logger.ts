// Custom logger that works in production
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: this.isClient ? window.location.href : undefined,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = this.formatMessage(level, message, data);
    
    // Always log in development
    if (this.isDevelopment) {
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
      return;
    }

    // In production, use different strategies
    if (this.isClient) {
      // Client-side: use console for critical logs
      if (level === 'error' || level === 'warn') {
        const consoleMethod = console[level] || console.log;
        consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
      }
      
      // Send to external logging service (optional)
      this.sendToExternalLogger(logEntry);
    } else {
      // Server-side: always log (will appear in Vercel function logs)
      const consoleMethod = console[level] || console.log;
      consoleMethod(JSON.stringify(logEntry));
    }
  }

  private sendToExternalLogger(logEntry: LogEntry) {
    // Disabled: Previously sent logs to /api/logs endpoint
    // Now logs are only stored in browser console
    // If you need server-side logging, implement it in your backend
    // and call /api/proxy/logs instead
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // API response logger
  apiResponse(url: string, response: any, duration?: number) {
    this.info(`API Response: ${url}`, {
      response,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  // API error logger
  apiError(url: string, error: any, duration?: number) {
    this.error(`API Error: ${url}`, {
      error: error.message || error,
      duration: duration ? `${duration}ms` : undefined,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for backward compatibility
export default logger;
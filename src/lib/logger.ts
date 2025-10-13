// Production-safe logging utility
// Replaces console.log/error throughout the application

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
    // TODO: Send to monitoring service in production
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
    // TODO: Send to error tracking service (e.g., Sentry)
    // if (!this.isDevelopment) {
    //   Sentry.captureException(error, { extra: { message } });
    // }
  }

  // Structured logging for audit trails
  audit(action: string, resource: string, metadata?: any) {
    const entry: LogEntry = {
      level: 'info',
      message: `${action} on ${resource}`,
      data: metadata,
      timestamp: new Date()
    };
    
    if (this.isDevelopment) {
      console.log('[AUDIT]', entry);
    }
    // TODO: Send to audit log service in production
  }
}

export const logger = new Logger();

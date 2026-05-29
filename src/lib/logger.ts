import { sendCriticalAlert } from './alert';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  path?: string;
  method?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  data?: Record<string, unknown>;
}

interface LogContext {
  path?: string;
  method?: string;
  data?: Record<string, unknown>;
}

interface ErrorContext extends LogContext {
  error?: unknown;
}

const MAX_STACK_LENGTH = 500;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function formatError(err: unknown): LogEntry['error'] {
  if (err instanceof Error) {
    let stack = err.stack;
    if (stack && isProduction()) {
      stack = stack.slice(0, MAX_STACK_LENGTH);
    }
    return {
      name: err.name,
      message: err.message,
      stack,
    };
  }

  return {
    name: 'UnknownError',
    message: String(err),
  };
}

function buildEntry(
  level: LogLevel,
  message: string,
  context?: LogContext & { error?: unknown }
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context?.path) entry.path = context.path;
  if (context?.method) entry.method = context.method;
  if (context?.error) entry.error = formatError(context.error);
  if (context?.data) entry.data = context.data;

  return entry;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(JSON.stringify(buildEntry('INFO', message, context)));
  },

  warn(message: string, context?: LogContext) {
    console.warn(JSON.stringify(buildEntry('WARN', message, context)));
  },

  error(message: string, context?: ErrorContext) {
    const entry = buildEntry('ERROR', message, context);
    console.error(JSON.stringify(entry));

    // Asynchronously send alert email without blocking execution
    sendCriticalAlert(message, JSON.stringify(entry, null, 2)).catch((err) => {
      console.error('[logger] Failed to send email alert:', err);
    });
  },
};

/**
 * Returns a scoped logger with path and method pre-filled from the request.
 *
 * Usage:
 *   const log = withRequestContext(req);
 *   log.info('Booking created', { data: { bookingId: '123' } });
 *   log.error('Booking failed', { error: err });
 */
export function withRequestContext(req: Request) {
  const url = new URL(req.url);
  const base: LogContext = {
    path: url.pathname,
    method: req.method,
  };

  return {
    info(message: string, context?: Omit<LogContext, 'path' | 'method'>) {
      logger.info(message, { ...base, ...context });
    },

    warn(message: string, context?: Omit<LogContext, 'path' | 'method'>) {
      logger.warn(message, { ...base, ...context });
    },

    error(
      message: string,
      context?: Omit<ErrorContext, 'path' | 'method'>
    ) {
      logger.error(message, { ...base, ...context });
    },
  };
}

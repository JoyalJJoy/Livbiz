import * as Sentry from '@sentry/nextjs';

export function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

export function onRequestError(error: Error, request: { path: string; method: string; headers: Record<string, string | string[]> }, context: { routerKind: string; routePath: string; routeType: string }) {
  Sentry.captureException(error, {
    tags: { routeType: context.routeType, routerKind: context.routerKind },
    extra: { path: request.path, method: request.method },
  });
}

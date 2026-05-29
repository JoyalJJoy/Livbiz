import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

// ---------------------------------------------------------------------------
// Rate-limit configuration (requests per minute per IP)
// ---------------------------------------------------------------------------

interface RouteLimit {
  pattern: RegExp;
  limit: number;
}

/**
 * Route-specific limits evaluated top-to-bottom — first match wins.
 * More specific routes must appear before broader catch-alls.
 */
const ROUTE_LIMITS: RouteLimit[] = [
  { pattern: /^\/api\/auth\/signup/,           limit: 5  },
  { pattern: /^\/api\/auth\/forgot-password/,  limit: 5  },
  { pattern: /^\/api\/auth\/reset-password/,   limit: 10 },
  { pattern: /^\/api\/auth/,                   limit: 10 },
  { pattern: /^\/api\/bookings\/create/,       limit: 10 },
  { pattern: /^\/api\/bookings\/verify-ticket/,limit: 10 },
  { pattern: /^\/api\/slots/,                  limit: 30 },
  { pattern: /^\/api\/dashboard/,              limit: 30 },
  { pattern: /^\/api\/admin/,                  limit: 30 },
];

const DEFAULT_LIMIT = 20;

// ---------------------------------------------------------------------------
// In-process LRU cache — mirrors the approach in src/lib/rate-limiter.ts
// ---------------------------------------------------------------------------

const rateLimitCache = new LRUCache<string, number>({
  max: 10_000,
  ttl: 60 * 1000, // 1-minute sliding window
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLimitForPath(pathname: string): number {
  for (const route of ROUTE_LIMITS) {
    if (route.pattern.test(pathname)) {
      return route.limit;
    }
  }
  return DEFAULT_LIMIT;
}

function checkRateLimit(
  key: string,
  limit: number,
): { limited: boolean; limit: number; remaining: number } {
  const currentHits = rateLimitCache.get(key) || 0;

  if (currentHits >= limit) {
    return { limited: true, limit, remaining: 0 };
  }

  const nextHits = currentHits + 1;
  rateLimitCache.set(key, nextHits);

  return { limited: false, limit, remaining: Math.max(0, limit - nextHits) };
}

// ---------------------------------------------------------------------------
// Proxy Function (Next.js 16 named proxy export)
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Resolve client IP — respect proxied header, fall back to 'anonymous'
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'anonymous';

  const limit = getLimitForPath(pathname);
  const cacheKey = `rate:${ip}:${pathname}`;
  const { limited, remaining } = checkRateLimit(cacheKey, limit);

  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // Forward the request and attach rate-limit headers to the response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));

  return response;
}

// ---------------------------------------------------------------------------
// Only run this proxy for API routes
// ---------------------------------------------------------------------------

export const config = {
  matcher: '/api/:path*',
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';
import { updateSupabaseSession } from '@/lib/supabase/proxy';

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

const protectedRoutes = ['/dashboard', '/admin'];
const authRoutes = ['/login', '/reset-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always refresh the Supabase auth session (for all routes)
  const { supabaseResponse, user } = await updateSupabaseSession(request);

  // 2. Route protection — redirect unauthenticated users away from protected pages
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Only apply rate-limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

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

  // Attach rate-limit headers to the Supabase-refreshed response
  supabaseResponse.headers.set('X-RateLimit-Limit', String(limit));
  supabaseResponse.headers.set('X-RateLimit-Remaining', String(remaining));

  return supabaseResponse;
}

// ---------------------------------------------------------------------------
// Run proxy on all routes except static files
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images in public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

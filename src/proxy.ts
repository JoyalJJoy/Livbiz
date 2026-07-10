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
// CSRF Protection Helpers
// ---------------------------------------------------------------------------

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function isStateChangingMethod(method: string): boolean {
  return STATE_CHANGING_METHODS.includes(method.toUpperCase());
}

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Browser-originated requests always include Origin or Referer.
  // Their absence suggests a non-browser client (curl, Postman, server-to-server).
  // Allow through if neither is present (API clients).
  if (!origin && !referer) return true;

  const host = request.headers.get('host') || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const allowedOrigins = [siteUrl];

  // Derive the origin from the Host header (covers deployed environments)
  const protocol = request.nextUrl.protocol || 'https:';
  allowedOrigins.push(`${protocol}//${host}`);

  // Allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
  }

  const extractOrigin = (url: string) => {
    try { return new URL(url).origin; } catch { return null; }
  };

  if (origin) {
    const o = extractOrigin(origin);
    if (!o || !allowedOrigins.includes(o)) return false;
  }
  if (referer) {
    const o = extractOrigin(referer);
    if (!o || !allowedOrigins.includes(o)) return false;
  }

  return true;
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

  // 2. Only apply rate-limiting + CSRF to API routes
  if (!pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  // 3. CSRF: block state-changing requests from unknown origins
  if (isStateChangingMethod(request.method) && !isValidOrigin(request)) {
    return NextResponse.json(
      { error: 'Cross-site request blocked' },
      { status: 403 },
    );
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

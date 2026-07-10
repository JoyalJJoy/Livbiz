import { LRUCache } from 'lru-cache';

// Keep track of up to 5,000 unique visitor IPs with a 1-minute sliding window
const rateLimiterCache = new LRUCache<string, number>({
  max: 5000,
  ttl: 60 * 1000, // 1 minute window
});

interface RateLimitResponse {
  limited: boolean;
  limit: number;
  remaining: number;
}

/**
 * Validates request counts against a specific IP address
 * @param ip The visitor IP address
 * @param limit The maximum permitted hits per minute
 */
export function isRateLimited(ip: string, limit: number): RateLimitResponse {
  const currentHits = rateLimiterCache.get(ip) || 0;

  if (currentHits >= limit) {
    return {
      limited: true,
      limit,
      remaining: 0,
    };
  }

  const nextHits = currentHits + 1;
  rateLimiterCache.set(ip, nextHits);

  return {
    limited: false,
    limit,
    remaining: Math.max(0, limit - nextHits),
  };
}

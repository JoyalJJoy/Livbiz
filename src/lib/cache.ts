import { LRUCache } from 'lru-cache';

/**
 * Server-side in-memory cache for API responses.
 * 
 * - Slots list: cached 60s (rarely changes)
 * - Admin stats: cached 5s (aggregation queries are expensive)
 * - Dashboard stats: cached 10s per user
 * 
 * For multi-instance deployments, upgrade to Redis.
 * For a single Next.js server, LRU is simpler and faster (~0.01ms reads).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>({
  max: 500,            // max 500 entries
  ttl: 1000 * 60,      // default 60s TTL
  allowStale: false,
  updateAgeOnGet: false,
});

/**
 * Get a cached value or compute & store it.
 * 
 * @param key - Cache key
 * @param fetcher - Async function to compute the value if not cached
 * @param ttlMs - Time-to-live in milliseconds (overrides default)
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  const existing = cache.get(key);
  if (existing !== undefined) {
    return existing as T;
  }

  const value = await fetcher();
  cache.set(key, value, { ttl: ttlMs });
  return value;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string) {
  if (keyOrPrefix.endsWith('*')) {
    const prefix = keyOrPrefix.slice(0, -1);
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.delete(keyOrPrefix);
  }
}

export default cache;

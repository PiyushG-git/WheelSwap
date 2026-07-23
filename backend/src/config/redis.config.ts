import IORedis from 'ioredis';
import { env } from './env.config';
import { logger } from './logger.config';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times: number) {
    // Limit retries if Redis is not running locally
    if (times > 3) {
      logger.warn('⚠️ Redis connection retries exhausted. Running without cache.');
      return null;
    }
    return Math.min(times * 200, 1000);
  },
};

/**
 * Primary Redis client for caching
 */
export const redis = new IORedis(redisConfig);

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err: Error) => {
  const errorWithCode = err as Error & { code?: string };
  if (errorWithCode.code !== 'ECONNREFUSED') {
    logger.error('Redis error:', err.message);
  }
});

// ─────────────────────────────────────────────
// Cache Helpers (failsafes for offline Redis)
// ─────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status !== 'ready') return null;
      const data = await redis.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Cache failures should never break the app
    }
  },

  async del(key: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      await redis.del(key);
    } catch {
      // Silently fail
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Silently fail
    }
  },

  keys: {
    user: (id: string) => `user:${id}`,
    vehicleList: (query: string) => `vehicles:${query}`,
    vehicleDetail: (id: string) => `vehicle:${id}`,
    userVehicles: (userId: string) => `user:${userId}:vehicles`,
  },
};

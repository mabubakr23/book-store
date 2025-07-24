import Redis from 'ioredis';
import { Book } from '@prisma/client';

// Create Redis client with reconnection strategy
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || 'your_redis_password',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Cache TTL in seconds (1 hour)
const CACHE_TTL = 3600;

// Handle Redis events
redis.on('connect', () => {
  console.log('[REDIS] Connected to Redis server');
});

redis.on('error', (error) => {
  console.error('[REDIS] Error:', error);
});

redis.on('reconnecting', () => {
  console.log('[REDIS] Reconnecting to Redis server...');
});

redis.on('ready', () => {
  console.log('[REDIS] Redis client ready');
});

const serializeBook = (book: Book): any => ({
  ...book,
  createdAt: book.createdAt.toISOString(),
  updatedAt: book.updatedAt.toISOString()
});

const deserializeBook = (book: any): Book => ({
  ...book,
  createdAt: new Date(book.createdAt),
  updatedAt: new Date(book.updatedAt)
});

export const getCachedBooks = async (key: string): Promise<{ books: Book[]; total: number } | null> => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return {
        books: parsed.books.map(deserializeBook),
        total: parsed.total
      };
    }
    return null;
  } catch (error) {
    console.error('[REDIS] Get error:', error);
    return null;
  }
};

export const setCachedBooks = async (
  key: string,
  data: { books: Book[]; total: number }
): Promise<void> => {
  try {
    const serializedData = {
      books: data.books.map(serializeBook),
      total: data.total
    };
    await redis.setex(key, CACHE_TTL, JSON.stringify(serializedData));
  } catch (error) {
    console.error('[REDIS] Set error:', error);
  }
};

export const generateCacheKey = (
  search: string,
  options: { limit?: number; page?: number; getAll?: boolean; genres?: string[] }
): string => {
  const { limit, page, getAll, genres } = options;
  return `books:search:${search}:${limit || 'default'}:${page || 1}:${getAll ? 'all' : 'paginated'}:${genres?.join(',') || 'no-genres'}`;
};

export const clearBookCache = async (): Promise<void> => {
  try {
    const keys = await redis.keys('books:search:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('[REDIS] Clear cache error:', error);
  }
}; 
import { redis, getCachedBooks, setCachedBooks, generateCacheKey, clearBookCache } from '../src/services/redis.service';
import { Book } from '@prisma/client';

describe('Redis Service', () => {
  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    authorList: ['Test Author'],
    genreList: ['Test Genre'],
    sellPrice: 10.99,
    stockPrice: 5.99,
    borrowPrice: 2.99,
    publishedYear: 2024,
    pageCount: 100,
    publisher: 'Test Publisher',
    isbn: '1234567890',
    currentCopies: 10,
    initialStock: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSearchResult = {
    books: [mockBook],
    total: 1
  };

  beforeEach(async () => {
    // Clear Redis cache before each test
    await clearBookCache();
  });

  afterAll(async () => {
    // Close Redis connection after all tests
    await redis.quit();
  });

  describe('Cache Operations', () => {
    it('should set and get cached books', async () => {
      const key = 'test:books';
      await setCachedBooks(key, mockSearchResult);
      const cachedResult = await getCachedBooks(key);
      
      expect(cachedResult).toEqual(mockSearchResult);
    });

    it('should return null for non-existent cache key', async () => {
      const cachedResult = await getCachedBooks('non-existent-key');
      expect(cachedResult).toBeNull();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate correct cache key with all parameters', () => {
      const search = 'test';
      const options = {
        limit: 10,
        page: 2,
        getAll: false,
        genres: ['fiction', 'sci-fi']
      };

      const key = generateCacheKey(search, options);
      expect(key).toBe('books:search:test:10:2:paginated:fiction,sci-fi');
    });

    it('should generate correct cache key with default values', () => {
      const search = 'test';
      const options = {};

      const key = generateCacheKey(search, options);
      expect(key).toBe('books:search:test:default:1:paginated:no-genres');
    });
  });

  describe('Cache Clearing', () => {
    it('should clear all book-related cache', async () => {
      // Set some test data
      await setCachedBooks('books:search:test1', mockSearchResult);
      await setCachedBooks('books:search:test2', mockSearchResult);

      // Clear cache
      await clearBookCache();

      // Verify cache is cleared
      const result1 = await getCachedBooks('books:search:test1');
      const result2 = await getCachedBooks('books:search:test2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('Redis Connection', () => {
    it('should be able to ping Redis server', async () => {
      const pingResult = await redis.ping();
      expect(pingResult).toBe('PONG');
    });

    it('should handle Redis errors gracefully', async () => {
      // Simulate Redis error by using invalid key
      const result = await getCachedBooks('');
      expect(result).toBeNull();
    });
  });
}); 
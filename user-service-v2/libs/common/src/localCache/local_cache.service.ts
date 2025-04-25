import { Cache } from 'cache-manager';
import { createCache } from 'cache-manager';

export class LocalCacheService {
  private static instance: LocalCacheService;
  private cache: Cache;

  private constructor() {
    this.cache = createCache({});
  }

  static getInstance(): LocalCacheService {
    if (!LocalCacheService.instance) {
      LocalCacheService.instance = new LocalCacheService();
    }
    return LocalCacheService.instance;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl || 10 * 1000);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async getTTl(key: string): Promise<number> {
    return await this.cache.ttl(key);
  }
}

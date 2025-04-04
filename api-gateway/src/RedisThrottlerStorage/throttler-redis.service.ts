import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { Redis } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Injectable()
export class RedisThrottlerStorageService implements ThrottlerStorage {
  private redis: Redis;
  private logger: Logger;
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST, // Thay bằng cấu hình Redis của bạn
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      db: 0,
    });

    this.logger = new Logger(RedisThrottlerStorageService.name);
  }

  async getRecord(key: string): Promise<ThrottlerStorageRecord | undefined> {
    const value = await this.redis.get(key);
    if (value) {
      // Fetch the TTL from redis cache
      const ttl = await this.redis.ttl(key);
      const record: ThrottlerStorageRecord = {
        totalHits: parseInt(value, 10),
        timeToExpire: ttl,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
      return record;
    }
    return undefined;
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    let oldValue = 0;
    const val = await this.redis.get(throttlerName);
    if (val) {
      oldValue = parseInt(val, 10);
      ttl = await this.redis.ttl(throttlerName);
    }

    const newValue = oldValue + 1;
    // set the new updated value in cache
    await this.redis.setex(throttlerName, ttl, newValue);
    const record: ThrottlerStorageRecord = {
      totalHits: newValue,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
    return record;
  }

  async clearRecord(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

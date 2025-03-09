import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis;
  private logger: Logger;
  onModuleInit() {
    this.logger = new Logger(CacheService.name);
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_HOST),
      password: process.env.REDIS_PASSWORD,
      db: 0,
    });
    this.logger.error('init cache service');
  }

  // Phương thức để lấy Redis instance
  getClient(): Redis {
    return this.redis;
  }

  onModuleDestroy() {
    this.redis.quit();
  }
}

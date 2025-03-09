import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PublicThrottlerGuard extends ThrottlerGuard {
  private redis: Redis;
  private configService: ConfigService;
  private limit: number;
  private apis: string[];
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    apis: string[],
  ) {
    super(options, storageService, reflector);
    this.configService = new ConfigService();
    this.redis = new Redis({
      port: this.configService.get<number>('REDIS_PORT'),
      host: this.configService.get<string>('REDIS_HOST'),
      db: 0,
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.limit = this.configService.get<number>('RATE_LIMIT_PUBLIC');
    this.apis = apis;
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip;
    const url = req.url;
    return new Promise<string>((resolve, reject) => {
      return resolve(`${ip}-${url}`);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url as string;
    if (!this.apis.includes(url)) {
      return true;
    }
    const key = await this.getTracker(request);

    const rateLimitPublic = await this.redis.get(key);
    if (rateLimitPublic && +rateLimitPublic >= this.limit) {
      throw new ThrottlerException();
    }

    const ttl = await this.redis.ttl(key);
    await this.redis.setex(key, ttl > 0 ? ttl : 60, +rateLimitPublic + 1 || 1);
    return true;
  }
}

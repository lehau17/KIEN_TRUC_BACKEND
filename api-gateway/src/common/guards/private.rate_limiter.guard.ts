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
export class PrivateThrottlerGuard extends ThrottlerGuard {
  private redis: Redis;
  private configService: ConfigService;
  private limit: number;
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
    this.configService = new ConfigService();
    this.redis = new Redis({
      port: this.configService.get<number>('REDIS_PORT'),
      host: this.configService.get<string>('REDIS_HOST'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: 0,
    });
    this.limit = this.configService.get<number>('RATE_LIMIT_PRIVATE');
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user;
    console.log('check user', user);
    return new Promise<string>((resolve, reject) => {
      return resolve(`rate-limit:private:${user.id}`);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      // console.log('bỏ qua private rate limiter');
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const key = await this.getTracker(request);

    const rateLimitPrivate = await this.redis.get(key);
    if (rateLimitPrivate && +rateLimitPrivate >= this.limit) {
      throw new ThrottlerException('Too many requests');
    }

    const ttl = await this.redis.ttl(key);
    await this.redis.setex(key, ttl > 0 ? ttl : 60, +rateLimitPrivate + 1 || 1);
    return true;
  }
}

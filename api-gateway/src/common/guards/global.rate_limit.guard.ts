import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
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
      db: 0,
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.limit = this.configService.get<number>('RATE_LIMIT_GLOBAL');
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      return resolve('rate-limit:global');
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('global canActivate');
    const request = context.switchToHttp().getRequest();
    // const key = 'rate-limit:global';
    const key = await this.getTracker(request);
    const rateLimitGlobal = await this.redis.get(key);
    console.log('check limit', this.limit);
    if (rateLimitGlobal && +rateLimitGlobal >= this.limit) {
      throw new ThrottlerException('Too many requests');
    }

    const ttl = await this.redis.ttl(key);
    await this.redis.setex(key, ttl > 0 ? ttl : 60, +rateLimitGlobal + 1 || 1);
    return true;
  }

  // protected async handleRequest({
  //   blockDuration,
  //   context,
  //   generateKey,
  //   getTracker,
  //   limit,
  //   throttler,
  //   ttl,
  // }: ThrottlerRequest): Promise<boolean> {
  //   console.log('handle request');
  //   const request = context.switchToHttp().getRequest();
  //   const key = await getTracker(request, context);

  //   const rateLimitGlobal = await this.redis.get(key);

  //   if (!rateLimitGlobal || rateLimitGlobal === null) return true;

  //   if (+rateLimitGlobal >= limit) {
  //     throw new ThrottlerException();
  //   } else {
  //     // increase redis
  //     const newTTl = await this.redis.ttl(key);
  //     await this.redis.setex(key, newTTl, +rateLimitGlobal + 1);
  //   }

  //   return true;
  // }
}

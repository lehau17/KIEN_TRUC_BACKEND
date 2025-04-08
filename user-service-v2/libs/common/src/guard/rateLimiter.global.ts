import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { LocalCacheService } from '../localCache';
import { LOCAL_CACHE_KEY, MessageResponse } from '../constraint';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalRateLimiter implements CanActivate {
  private cache: LocalCacheService;
  private limitGlobal: number;
  constructor(private readonly configService: ConfigService) {
    this.limitGlobal = this.configService.get<number>('limitGlobal') || 10;
    this.cache = LocalCacheService.getInstance();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // getKey in localCache
    const value = await this.cache.get<string>(LOCAL_CACHE_KEY);
    if (!value || value === '') {
      // set key in localCache
      await this.cache.set<string>(LOCAL_CACHE_KEY, '1', 10000);
    } else {
      // co roi
      if (Number(value) > this.limitGlobal) {
        throw new HttpException(
          MessageResponse.TOO_MANY_REQUESTS,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      const ttl = await this.cache.getTTl(LOCAL_CACHE_KEY);
      this.cache.set<string>(
        LOCAL_CACHE_KEY,
        String(Number(value) + 1),
        ttl - new Date().getTime(),
      );
    }
    return true;
  }
}

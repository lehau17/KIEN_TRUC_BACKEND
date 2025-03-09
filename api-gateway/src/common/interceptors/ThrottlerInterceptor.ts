import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler';
import { catchError, Observable } from 'rxjs';
import { RedisThrottlerStorageService } from 'src/RedisThrottlerStorage/throttler-redis.service';
@Injectable()
export class GlobalRateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private customRedisThrottlerStorage: RedisThrottlerStorageService,
  ) {}
  async isRateLimited(key: string) {
    const limit = this.configService.get<number>('RATE_LIMIT_GLOBAL', 5);
    const record = await this.customRedisThrottlerStorage.getRecord(key);
    if (!record) return false;
    return record.totalHits > limit;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const ttl = this.configService.get<number>('RATE_LIMIT_TTL', 60); // TTL từ config
    // Kiểm tra rate limit
    const isLimited = await this.isRateLimited('rate-limit:global');
    if (isLimited) {
      throw new ThrottlerException('Too many requests');
    }

    // Nếu không bị giới hạn, tăng số lần truy cập
    await this.customRedisThrottlerStorage.increment(
      '',
      ttl,
      5,
      60,
      'rate-limit:global',
    );

    return next.handle(); // Xử lý tiếp chuỗi middleware
  }
}

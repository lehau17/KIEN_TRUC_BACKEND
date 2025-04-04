import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TokenPayload } from '../types/jwt.type';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BlackListGuard implements CanActivate {
  private redis: Redis;
  private reflector: Reflector;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      port: this.configService.get<number>('REDIS_PORT'),
      host: this.configService.get<string>('REDIS_HOST'),
      db: 0,
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.reflector = new Reflector();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy thông tin người dùng từ request
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const { id } = request.user as TokenPayload;

    // Kiểm tra nếu id người dùng có tồn tại trong Redis (blacklist)
    const isExist = await this.redis.exists(String(id));

    if (isExist !== 0) {
      throw new ForbiddenException('Tai khoan khong kha dung');
    }

    return true;
  }
}

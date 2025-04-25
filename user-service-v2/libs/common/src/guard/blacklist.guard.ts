import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LocalCacheService } from '../localCache';
import { Reflector } from '@nestjs/core';
import { MessageResponse, USER_PAYLOAD } from '../constraint';
import { IS_PUBLIC } from '../decorator';

@Injectable()
export class BlackListGuard implements CanActivate {
  private cache: LocalCacheService;
  constructor(private readonly reflector: Reflector) {
    this.cache = LocalCacheService.getInstance();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicApi = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (publicApi) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const { id } = request[USER_PAYLOAD];
    const key = this.genKey(id);
    const isExist = await this.cache.get(key);
    if (isExist) {
      throw new ForbiddenException(MessageResponse.FORBIDDEN_DEACTIVE);
    }
    return true;
  }

  genKey(id: number): string {
    return `BLACKLIST:${id}`;
  }
}

import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MessageResponse, USER_PAYLOAD } from '../constraint';
import { IS_PUBLIC } from '../decorator';
import { LocalCacheService } from '../localCache';

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
        const userPayload = request[USER_PAYLOAD];

        if (!userPayload || !userPayload.jti) {
            throw new ForbiddenException('Token không hợp lệ hoặc thiếu jti!');
        }

        const jti = userPayload.jti;
        const key = this.genKey(jti); // 👈 Key theo jti
        const isExist = await this.cache.get(key);

        if (isExist) {
            throw new ForbiddenException(MessageResponse.FORBIDDEN_DEACTIVE);
        }

        return true;
    }

    private genKey(jti: string): string {
        return `BLACKLIST:JTI:${jti}`;
    }
}

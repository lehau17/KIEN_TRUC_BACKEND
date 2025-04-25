import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from '../types';
import { MessageResponse, USER_PAYLOAD } from '../constraint';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private accessTokenKey: string;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.accessTokenKey = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicApi = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (publicApi) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.accessTokenKey,
      });

      request[USER_PAYLOAD] = payload;
    } catch {
      throw new UnauthorizedException(MessageResponse.UNAUTHORIZE);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

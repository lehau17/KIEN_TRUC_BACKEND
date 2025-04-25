import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from '../types';
import { MessageResponse, USER_PAYLOAD } from '../constraint';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC, ROLE_DECO } from '../decorator';
import { RoleService } from 'src/role/role.service';

// nằm sau accessTokenGuard
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const publicApi = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (publicApi) {
      return true;
    }
    const roles = this.reflector.get<string[]>(ROLE_DECO, context.getHandler());
    const user: TokenPayload = request[USER_PAYLOAD];

    if (!roles || roles.length === 0) {
      return true;
    }
    for (const role of roles) {
      if (user.roles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException(MessageResponse.FORBIDDEN);
  }
}

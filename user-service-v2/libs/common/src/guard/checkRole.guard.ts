import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TokenPayload } from '../types';
import { MessageResponse, USER_PAYLOAD } from '../constraint';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class CheckRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;
    const method = request.method;

    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const user: TokenPayload = request[USER_PAYLOAD];

    if (user.roles.includes('ADMIN')) {
      console.log('Toàn quyền vào hệ thống');
      return true;
    }

    const userPermissions = await this.prismaService.permissions.findMany({
      where: {
        role: {
          role: user.roles[0],
        },
        resource: {
          path: path,
        },
      },
      select: {
        permission: true,
      },
    });
    console.log('check quyen', userPermissions);

    if (userPermissions.length === 0) {
      throw new ForbiddenException(MessageResponse.FORBIDDEN);
    }

    const permissionArray = userPermissions.map((per) => per.permission);

    if (this.hasPermission(method, permissionArray)) {
      return true;
    }

    throw new ForbiddenException(MessageResponse.FORBIDDEN);
  }

  private hasPermission(method: string, permissions: string[]): boolean {
    switch (method) {
      case 'GET':
        return (
          permissions.includes('READ_ALL') || permissions.includes('READ_OWN')
        );
      case 'POST':
        return (
          permissions.includes('WRITE_ALL') || permissions.includes('WRITE_OWN')
        );
      case 'PATCH':
      case 'PUT':
        return permissions.includes('WRITE_ALL');
      case 'DELETE':
        return permissions.includes('WRITE_ALL');
      default:
        return false;
    }
  }
}

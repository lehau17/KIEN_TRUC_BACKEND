import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(context: any): boolean | Promise<boolean> | Observable<boolean> {
    // Kiểm tra decorator @Public trước khi gọi logic của guard
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context); // Gọi AuthGuard của passport nếu không phải public
  }
}

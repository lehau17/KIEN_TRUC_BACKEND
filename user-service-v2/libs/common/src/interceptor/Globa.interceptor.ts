import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MESSAGE_DECORATOR } from '../decorator';
import { MessageResponse, StatusCodeResponse } from '../constraint';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message =
      this.reflector.get<MessageResponse>(
        MESSAGE_DECORATOR,
        context.getHandler(),
      ) || MessageResponse.SUCCESS;
    const code = StatusCodeResponse[message];
    return next.handle().pipe(
      map((data) => ({
        message,
        code,
        success: true,
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}

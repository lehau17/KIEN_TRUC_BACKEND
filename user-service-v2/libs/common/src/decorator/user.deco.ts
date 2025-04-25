import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER_PAYLOAD } from '../constraint';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[USER_PAYLOAD];
  },
);

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenTokenGuard extends AuthGuard('jwt-refresh') {}

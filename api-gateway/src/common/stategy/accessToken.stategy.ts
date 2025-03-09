import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt'; // Đảm bảo rằng bạn đã import JwtService
import { TokenPayload } from '../types/jwt.type';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'Le trung hau',
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}

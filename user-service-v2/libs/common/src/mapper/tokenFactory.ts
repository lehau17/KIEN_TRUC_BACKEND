import { TokenPayload, TokenType } from '../types';

export class TokenFactory {
  static createAccessToken(
    id: number,
    username: string,
    roles: string[],
  ): TokenPayload {
    return new TokenPayload(id, username, roles, TokenType.ACCESS_TOKEN);
  }

  static createRefreshToken(
    id: number,
    username: string,
    roles: string[],
  ): TokenPayload {
    return new TokenPayload(id, username, roles, TokenType.REFRESH_TOKEN);
  }
}

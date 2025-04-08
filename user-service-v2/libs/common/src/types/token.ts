export class TokenPayload {
  id: number;
  username: string;
  roles: string[];
  typeToken: TokenType;
  iat?: number;

  constructor(
    id: number,
    username: string,
    roles: string[],
    typeToken: TokenType,
  ) {
    this.id = id;
    this.username = username;
    this.roles = roles;
    this.typeToken = typeToken;
    this.iat = new Date().getTime();
  }
}

export enum TokenType {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
}

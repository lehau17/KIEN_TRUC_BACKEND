import { TokenType } from '@app/common';

export interface TokenPayloadCreateDto {
  id: number;
  username: string;
  roles: string[];
  typeToken: TokenType;
}

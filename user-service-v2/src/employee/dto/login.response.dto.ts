import { UserResponseDto } from '@app/common';
import { users } from '@prisma/client';

export interface LoginResponseDto {
  info: UserResponseDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

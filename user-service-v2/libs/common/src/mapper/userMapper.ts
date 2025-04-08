import { UserResponseDto } from './../types/user';
import { users } from '@prisma/client';

export const mapperUserToUserResponse = (user: users): UserResponseDto => {
  const { password: _, ...response } = user;
  return response;
};

import { Status } from '@prisma/client';

export interface UserResponseDto {
  id: number;
  username: string;
  avatar: string;
  fullname: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

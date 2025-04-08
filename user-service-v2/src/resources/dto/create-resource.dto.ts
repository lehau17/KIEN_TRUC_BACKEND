import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @IsString()
  @ApiProperty({ example: '/api/users', description: 'Resource path' })
  path: string;

  @IsOptional()
  @ApiProperty({ example: 'active', enum: Status, required: false })
  @IsEnum(Status)
  status?: Status;
}

import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '/api/users', description: 'Resource path' })
  path?: string;

  @IsOptional()
  @ApiProperty({ example: 'active', enum: Status, required: false })
  @IsEnum(Status)
  status?: Status;
}

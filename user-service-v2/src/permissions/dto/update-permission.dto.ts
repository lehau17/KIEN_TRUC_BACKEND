import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { Permission } from '@prisma/client';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdatePermissionDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Role ID' })
  role_id: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Resource ID' })
  resource_id: number;

  @IsEnum(Permission)
  @IsNotEmpty()
  @ApiProperty({ example: 'READ_OWN', description: 'Permission type' })
  permission: Permission;
}

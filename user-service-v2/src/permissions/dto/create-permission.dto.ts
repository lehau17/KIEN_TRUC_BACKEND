import { IsEnum, IsInt } from 'class-validator';
import { Permission } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'Role ID' })
  role_id: number;

  @IsInt()
  @ApiProperty({ example: 1, description: 'Resource ID' })
  resource_id: number;

  @IsEnum(Permission)
  @ApiProperty({ example: 'READ_OWN', description: 'Permission type' })
  permission: Permission;
}

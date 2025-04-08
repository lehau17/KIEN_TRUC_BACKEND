import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Tên của vai trò (role)',
  })
  @IsNotEmpty()
  @IsString()
  role: string;
}
